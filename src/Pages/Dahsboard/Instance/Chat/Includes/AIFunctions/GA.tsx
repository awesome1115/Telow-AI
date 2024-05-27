import axios from 'axios';
import { MessageModel } from '@chatscope/chat-ui-kit-react';
import OpenAI from 'openai';
import {
  GAConnect,
  GAParams,
} from '../../../../../../API/Model/Connects/GAModel';

type DimensionHeader = {
  name: string;
};

type MetricHeader = {
  name: string;
  type: string;
};

type Row = {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
};

type Data = {
  dimensionHeaders: DimensionHeader[];
  metricHeaders: MetricHeader[];
  rows: Row[];
};

type TransformedRow = Record<string, string>;

const transformDataset: (data: Data) => TransformedRow[] = (data) => {
  if (!data.rows || !Array.isArray(data.rows)) {
    return [
      {
        QueryRespond: `As of now, there is no data for ${data.dimensionHeaders.map((d) => `${d.name}, `)} and ${data.metricHeaders.map((m) => `${m.name}, `)} `,
      },
    ];
  }

  try {
    return data.rows.map((row) => {
      const transformed: TransformedRow = {};

      row.dimensionValues.forEach((dimension, index) => {
        const headerName = data.dimensionHeaders[index]?.name;
        if (headerName) {
          transformed[headerName] = dimension.value;
        }
      });

      row.metricValues.forEach((metric, index) => {
        const headerName = data.metricHeaders[index]?.name;
        if (headerName) {
          transformed[headerName] = metric.value;
        }
      });

      return transformed;
    });
  } catch (error) {
    throw new Error(`Failed to transform Google Analytics dataset. ${error}`);
  }
};

/**
 * Google Analytics API Query
 * @param gaConnect
 * @param message
 * @returns
 */
const queryGoogleAnalytics = async (
  gaConnect: GAConnect,
  message: MessageModel,
  previousMessages: MessageModel[] = []
): Promise<string> => {
  console.log(previousMessages);
  if (!gaConnect) {
    return 'You must connect to Google Analytics first.';
  }

  const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: openAIKey,
    dangerouslyAllowBrowser: true,
  });

  const parseChatMessageForGAParameters = async (
    nMessage: MessageModel
  ): Promise<GAParams> => {
    console.log('The Message: ', nMessage.message);

    const today = new Date();
    const lastYear = new Date(new Date().setFullYear(today.getFullYear() - 1));
    const formatDate = (date: { toISOString: () => string }) =>
      date.toISOString().split('T')[0];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Extract Google Analytics 4 (GA4) query parameters from the user's request based on the API schema (https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), considering any context from previous messages. Return only the parameters as a strictly valid JSON object, without any additional text or explanations. The JSON object must strictly follow JSON syntax, with keys and string values in double quotes, properly separated by commas. Include metrics, dimensions, startDate, and endDate. Curren real time date is ${formatDate(today)}`,
          },
          {
            role: 'assistant',
            content: `Directly provide a JSON object in response to the user's latest message, considering the context of previous conversations. The JSON should only contain the extracted Google Analytics 4 query parameters, including a default date range of the past 365 days if not specified by the user, without any prefatory text, explanations, or markdown. Example of valid JSON structure: {"metrics":["activeUsers"],"dimensions":["date"],"startDate":"${formatDate(lastYear)}","endDate":"${formatDate(today)}"}. and only return the parameters as a strictly valid JSON object, without any additional text or explanations before or after it. The JSON object must strictly follow JSON syntax, with keys and string values in double quotes, properly separated by commas. Include metrics, dimensions, startDate, and endDate.`,
          },
          {
            role: 'assistant',
            content: `Current real time date is ${formatDate(today)}`,
          },
          {
            role: 'assistant',
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            content: `For dimensions, use this list to generate correct dimension values base on APIName: ${DefinedDemensions}`,
          },
          {
            role: 'assistant',
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            content: `For metrics, use this list to generate correct metrics values base on APIName: ${DefinedMetrics}`,
          },
          {
            role: 'user',
            content: nMessage.message || '',
          },
          ...previousMessages.map(
            (prevMessage) =>
              ({
                role: 'user',
                content: prevMessage.message || '',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }) as any
          ),
        ],
        temperature: 0.5,
        max_tokens: 200,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });

      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('OpenAI response is empty or malformed');
      }

      console.log(response.choices[0].message.content);
      const parsedResponse = JSON.parse(
        response.choices[0].message.content !== null
          ? response.choices[0].message.content
          : ''
      );
      console.log('AI Params: ', parsedResponse);

      if (!parsedResponse.metrics || !parsedResponse.dimensions) {
        throw new Error('Parsed response is missing required fields.');
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error parsing chat message for parameters:', error);
      throw error;
    }
  };

  try {
    const gaParams = await parseChatMessageForGAParameters(message);

    if (
      !Array.isArray(gaParams.metrics) ||
      !Array.isArray(gaParams.dimensions)
    ) {
      throw new Error(
        "GA parameters 'metrics' or 'dimensions' are not arrays."
      );
    }

    const url: string = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID,
      client_secret: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: gaConnect.refresh_token,
    });

    const authResponse = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!authResponse.data || !authResponse.data.access_token) {
      console.error('Failed to obtain access token from Google OAuth');
      return 'Error: Failed to authenticate with Google Analytics.';
    }

    const accessToken = authResponse.data.access_token;

    const gaResponse = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/${gaConnect.view_id}:runReport`,
      {
        dateRanges: [
          { startDate: gaParams.startDate, endDate: gaParams.endDate },
        ],
        metrics: gaParams.metrics.map((metric) => ({ name: metric })),
        dimensions: gaParams.dimensions.map((dimension) => ({
          name: dimension,
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!gaResponse.data) {
      console.error('Google Analytics response is empty or malformed');
      return 'Error: Google Analytics query failed.';
    }

    console.log('GA Res: ', gaResponse);

    console.log(JSON.stringify(transformDataset(gaResponse.data)));
    return JSON.stringify(transformDataset(gaResponse.data));
  } catch (error) {
    console.error(`Error: ${error}`);
    return `Error: Failed to query Google Analytics --> ${error}`;
  }
};

export default queryGoogleAnalytics;

/**
 * Dimensions Value / API Names
 */

const DefinedDemensions = `
- achievementId: The achievement ID in a game for an event. Populated by the event parameter achievement_id.
- adFormat: Describes the way ads looked and where they were located. Typical formats include Interstitial, Banner, Rewarded, and Native advanced.
- adSourceName: The source network that served the ad. Typical sources include AdMob Network, Liftoff, Facebook Audience Network, and Mediated house ads.
- adUnitName: The name you chose to describe this Ad unit. Ad units are containers you place in your apps to show ads to users.
- appVersion: The app's versionName (Android) or short bundle version (iOS).
- audienceId: The numeric identifier of an Audience. Users are reported in the audiences to which they belonged during the report's date range. Current user behavior does not affect historical audience membership in reports.
- audienceName: The given name of an Audience. Users are reported in the audiences to which they belonged during the report's date range. Current user behavior does not affect historical audience membership in reports.
- audienceResourceName: The resource name of this audience. Resource names contain both collection & resource identifiers to uniquely identify a resource; to learn more, see Resource names.
- brandingInterest: Interests demonstrated by users who are higher in the shopping funnel. Users can be counted in multiple interest categories. For example, Shoppers, Lifestyles & Hobbies/Pet Lovers, or Travel/Travel Buffs/Beachbound Travelers.
- browser: The browsers used to view your website.
- campaignId: The identifier of the marketing campaign. Present only for conversion events. Includes Google Ads Campaigns, Manual Campaigns, & other Campaigns.
- campaignName: The name of the marketing campaign. Present only for conversion events. Includes Google Ads Campaigns, Manual Campaigns, & other Campaigns.
- character: The player character in a game for an event. Populated by the event parameter character.
- city: The city from which the user activity originated.
- cityId: The geographic ID of the city from which the user activity originated, derived from their IP address.
- cohort: The cohort's name in the request. A cohort is a set of users who started using your website or app in any consecutive group of days. If a cohort name is not specified in the request, cohorts are named by their zero-based index: cohort_0, cohort_1, etc.
- cohortNthDay: Day offset relative to the firstSessionDate for the users in the cohort. For example, if a cohort is selected with the start and end date of 2020-03-01, then for the date 2020-03-02, cohortNthDay will be 0001.
- cohortNthMonth: Month offset relative to the firstSessionDate for the users in the cohort. Month boundaries align with calendar month boundaries. For example, if a cohort is selected with the start and end date in March 2020, then for any date in April 2020, cohortNthMonth will be 0001.
- cohortNthWeek: Week offset relative to the firstSessionDate for the users in the cohort. Weeks start on Sunday and end on Saturday. For example, if a cohort is selected with the start and end date in the range 2020-11-08 to 2020-11-14, then for the dates in the range 2020-11-15 to 2020-11-21, cohortNthWeek will be 0001.
- contentGroup: A category that applies to items of published content. Populated by the event parameter content_group.
- contentId: The identifier of the selected content. Populated by the event parameter content_id.
- contentType: The category of the selected content. Populated by the event parameter content_type.
- continent: The continent from which the user activity originated. For example, Americas or Asia.
- continentId: The geographic ID of the continent from which the user activity originated, derived from their IP address.
- country: The country from which the user activity originated.
- countryId: The geographic ID of the country from which the user activity originated, derived from their IP address. Formatted according to ISO 3166-1 alpha-2 standard.
- currencyCode: The local currency code (based on ISO 4217 standard) of the eCommerce event. For example, USD or GBP. Currency is specified in tagging by the currency parameter. Businesses that transact in more than one currency can specify a local currency code when sending eCommerce events to Analytics, and this dimension shows those currencies. To Learn more, See Currency reference.
- date: The date of the event, formatted as YYYYMMDD.
- dateHour: The combined values of date and hour formatted as YYYYMMDDHH.
- dateHourMinute: The combined values of date, hour, and minute formatted as YYYYMMDDHHMM.
- day: The day of the month, a two-digit number from 01 to 31.
- dayOfWeek: The integer day of the week. It returns values in the range [0,6] with Sunday as the first day of the week.
- dayOfWeekName: The day of the week in English. This dimension has values of Sunday, Monday, etc.
- defaultChannelGroup: The conversion's default channel group is based primarily on source and medium. An enumeration which includes Direct, Organic Search, Paid Social, Organic Social, Email, Affiliates, Referral, Paid Search, Video, and Display.
- deviceCategory: The type of device: Desktop, Tablet, or Mobile.
- deviceModel: The mobile device model (example: iPhone 10,6).
- eventName: The name of the event.
- fileExtension: The extension of the downloaded file (for example, pdf or txt). Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter file_extension.
- fileName: The page path of the downloaded file (for example, /menus/dinner-menu.pdf). Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter file_name.
- firstSessionDate: The date the user's first session occurred, formatted as YYYYMMDD.
- firstUserCampaignId: Identifier of the marketing campaign that first acquired the user. Includes Google Ads Campaigns, Manual Campaigns, & other Campaigns.
- firstUserCampaignName: Name of the marketing campaign that first acquired the user. Includes Google Ads Campaigns, Manual Campaigns, & other Campaigns.
- firstUserDefaultChannelGroup: The default channel group that first acquired the user. Default channel group is based primarily on source and medium. An enumeration which includes Direct, Organic Search, Paid Social, Organic Social, Email, Affiliates, Referral, Paid Search, Video, and Display.
- firstUserGoogleAdsAccountName: The Account name from Google Ads that first acquired the user.
- firstUserGoogleAdsAdGroupId: The Ad Group Id in Google Ads that first acquired the user.
- firstUserGoogleAdsAdGroupName: The Ad Group Name in Google Ads that first acquired the user.
- firstUserGoogleAdsAdNetworkType: The advertising network that first acquired the user. An enumeration which includes Google search, Search partners, Google Display Network, Youtube Search, Youtube Videos, Cross-network, Social, and (universal campaign).
- firstUserGoogleAdsCampaignId: Identifier of the Google Ads marketing campaign that first acquired the user.
- firstUserGoogleAdsCampaignName: Name of the Google Ads marketing campaign that first acquired the user.
- firstUserGoogleAdsCampaignType: The campaign type of the Google Ads campaign that first acquired the user. Campaign types determine where customers see your ads and the settings and options available to you in Google Ads. Campaign type is an enumeration that includes: Search, Display, Shopping, Video, Demand Gen, App, Smart, Hotel, Local, and Performance Max. To learn more, see Choose the right campaign type.
- firstUserGoogleAdsCreativeId: The ID of the Google Ads creative that first acquired the user. Creative IDs identify individual ads.
- firstUserGoogleAdsCustomerId: The Customer ID from Google Ads that first acquired the user. Customer IDs in Google Ads uniquely identify Google Ads accounts.
- firstUserGoogleAdsKeyword: First user Google Ads keyword text.
- firstUserGoogleAdsQuery: The search query that first acquired the user.
- firstUserManualAdContent: The ad content that first acquired the user. Populated by the utm_content parameter.
- firstUserManualTerm: The term that first acquired the user. Populated by the utm_term parameter.
- firstUserMedium: The medium that first acquired the user to your website or app.
- firstUserPrimaryChannelGroup: The primary channel group that originally acquired a user. Primary channel groups are the channel groups used in standard reports in Google Analytics and serve as an active record of your property's data in alignment with channel grouping over time. To learn more, see Custom channel groups.
- firstUserSource: The source that first acquired the user to your website or app.
- firstUserSourceMedium: The combined values of the dimensions firstUserSource and firstUserMedium.
- firstUserSourcePlatform: The source platform that first acquired the user. Please do not depend on this field returning Manual for traffic that uses UTMs; this field will update from returning Manual to returning (not set) for an upcoming feature launch.
- fullPageUrl: The hostname, page path, and query string for web pages visited; for example, the fullPageUrl portion of  https://www.example.com/store/contact-us?query_string=true is www.example.com/store/contact-us?query_string=true.
- googleAdsAccountName: The Account name from Google Ads for the campaign that led to the conversion event. Corresponds to customer.descriptive_name in the Google Ads API.
- googleAdsAdGroupId: The ad group id attributed to the conversion event.
- googleAdsAdGroupName: The ad group name attributed to the conversion event.
- googleAdsAdNetworkType: The advertising network type of the conversion. An enumeration which includes Google search, Search partners, Google Display Network, Youtube Search, Youtube Videos, Cross-network, Social, and (universal campaign).
- googleAdsCampaignId: The campaign ID for the Google Ads campaign attributed to the conversion event.
- googleAdsCampaignName: The campaign name for the Google Ads campaign attributed to the conversion event.
- googleAdsCampaignType: The campaign type for the Google Ads campaign attributed to the conversion event. Campaign types determine where customers see your ads and the settings and options available to you in Google Ads. Campaign type is an enumeration that includes: Search, Display, Shopping, Video, Demand Gen, App, Smart, Hotel, Local, and Performance Max. To learn more, see Choose the right campaign type.
- googleAdsCreativeId: The ID of the Google Ads creative attributed to the conversion event. Creative IDs identify individual ads.
- googleAdsCustomerId: The Customer ID from Google Ads for the campaign that led to conversion event. Customer IDs in Google Ads uniquely identify Google Ads accounts.
- googleAdsKeyword: The matched keyword that led to the conversion event. Keywords are words or phrases describing your product or service that you choose to get your ad in front of the right customers. To learn more about Keywords, see Keywords: Definition.
- googleAdsQuery: The search query that led to the conversion event.
- groupId: The player group ID in a game for an event. Populated by the event parameter group_id.
- hostName: Includes the subdomain and domain names of a URL; for example, the Host Name of www.example.com/contact.html is www.example.com.
- hour: The two-digit hour of the day that the event was logged. This dimension ranges from 0-23 and is reported in your property's timezone.
- isConversionEvent: The string true if the event is a conversion. Events are marked as conversions at collection time; changes to an event's conversion marking apply going forward. You can mark any event as a conversion in Google Analytics, and some events (i.e. first_open, purchase) are marked as conversions by default. To learn more, see About conversions.
- isoWeek: ISO week number, where each week starts on Monday. For details, see http://en.wikipedia.org/wiki/ISO_week_date. Example values include 01, 02, & 53.
- isoYear: The ISO year of the event. For details, see http://en.wikipedia.org/wiki/ISO_week_date. Example values include 2022 & 2023.
- isoYearIsoWeek: The combined values of isoWeek and isoYear. Example values include 201652 & 201701.
- itemAffiliation: The name or code of the affiliate (partner/vendor; if any) associated with an individual item. Populated by the affiliation item parameter.
- itemBrand: Brand name of the item.
- itemCategory: The hierarchical category in which the item is classified. For example, in Apparel/Mens/Summer/Shirts/T-shirts, Apparel is the item category.
- itemCategory2 through itemCategory5: Further hierarchical categories in which the item is classified, detailing the path down to the specific category of the item.
- itemId: The ID of the item.
- itemListId: The ID of the item list.
- itemListName: The name of the item list.
- itemListPosition: The position of an item (e.g., a product you sell) in a list. This dimension is populated in tagging by the index parameter in the items array.
- itemLocationID: The physical location associated with the item (e.g. the physical store location). It's recommended to use the Google Place ID that corresponds to the associated item. A custom location ID can also be used. This field is populated in tagging by the location_id parameter in the items array.
- itemName: The name of the item.
- itemPromotionCreativeName: The name of the item-promotion creative.
- itemPromotionCreativeSlot: The name of the promotional creative slot associated with the item. This dimension can be specified in tagging by the creative_slot parameter at the event or item level. If the parameter is specified at both the event & item level, the item-level parameter is used.
- itemPromotionId: The ID of the item promotion.
- itemPromotionName: The name of the promotion for the item.
- itemVariant: The specific variation of a product. e.g., XS, S, M, L for size; or Red, Blue, Green, Black for color. Populated by the item_variant parameter.
- landingPage: The page path associated with the first pageview in a session.
- landingPagePlusQueryString: The page path + query string associated with the first pageview in a session.
- language: The language setting of the user's browser or device. e.g., English.
- languageCode: The language setting (ISO 639) of the user's browser or device. e.g., en-us.
- level: The player's level in a game. Populated by the event parameter level.
- linkClasses: The HTML class attribute for an outbound link. For example, if a user clicks a link <a class="center" href="www.youtube.com">, this dimension will return center. Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter link_classes.
- linkDomain: The destination domain of the outbound link. For example, if a user clicks a link <a href="www.youtube.com">, this dimension will return youtube.com. Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter link_domain.
- linkId: The HTML id attribute for an outbound link or file download. For example, if a user clicks a link <a id="socialLinks" href="www.youtube.com">, this dimension will return socialLinks. Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter link_id.
- linkText: The link text of the file download. Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter link_text.
- linkUrl: The full URL for an outbound link or file download. For example, if a user clicks a link <a href="https://www.youtube.com/results?search_query=analytics">, this dimension will return https://www.youtube.com/results?search_query=analytics. Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter link_url.
- manualAdContent: The ad content attributed to the conversion event. Populated by the utm_content parameter.
- manualTerm: The term attributed to the conversion event. Populated by the utm_term parameter.
- medium: The medium attributed to the conversion event.
- method: The method by which an event was triggered. Populated by the event parameter method.
- minute: The two-digit minute of the hour that the event was logged. This dimension ranges from 0-59 and is reported in your property's timezone.
- mobileDeviceBranding: Manufacturer or branded name (examples: Samsung, HTC, Verizon, T-Mobile).
- mobileDeviceMarketingName: The branded device name (examples: Galaxy S10 or P30 Pro).
- mobileDeviceModel: The mobile device model name (examples: iPhone X or SM-G950F).
- month: The month of the event, a two-digit integer from 01 to 12.
- newVsReturning: New users have 0 previous sessions, and returning users have 1 or more previous sessions. This dimension returns two values: new or returning.
- nthDay through nthYear: Various dimensions representing the number of days, hours, minutes, months, weeks, and years since the start of the date range.
- operatingSystem: The operating systems used by visitors to your app or website. Includes desktop and mobile operating systems such as Windows and Android.
- operatingSystemVersion: The operating system versions used by visitors to your website or app. For example, Android 10's version is 10, and iOS 13.5.1's version is 13.5.1.
- operatingSystemWithVersion: The operating system and version. For example, Android 10 or Windows 7.
- orderCoupon: Code for the order-level coupon.
- outbound: Returns true if the link led to a site that is not a part of the property's domain. Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter outbound.
- pageLocation: The protocol, hostname, page path, and query string for web pages visited; for example, the pageLocation portion of https://www.example.com/store/contact-us?query_string=true is https://www.example.com/store/contact-us?query_string=true. Populated by the event parameter page_location.
- pagePath: The portion of the URL between the hostname and query string for web pages visited; for example, the pagePath portion of https://www.example.com/store/contact-us?query_string=true is query_string=true is/store/contact-us.
- pagePathPlusQueryString: The portion of the URL following the hostname for web pages visited; for example, the pagePathPlusQueryString portion of https://www.example.com/store/contact-us?query_string=true is /store/contact-us?query_string=true.
- pageReferrer: The full referring URL including the hostname and path. This referring URL is the user's previous URL and can be this website's domain or other domains. Populated by the event parameter page_referrer.
- pageTitle: The web page titles used on your site.
- percentScrolled: The percentage down the page that the user has scrolled (for example, 90). Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter percent_scrolled.
- platform: The platform on which your app or website ran; for example, web, iOS, or Android. To determine a stream's type in a report, use both platform and streamId.
- platformDeviceCategory: The platform and type of device on which your website or mobile app ran. (example: Android / mobile)
- primaryChannelGroup: The primary channel group attributed to the conversion event. Primary channel groups are the channel groups used in standard reports in Google Analytics and serve as an active record of your property's data in alignment with channel grouping over time. To learn more, see Custom channel groups.
- region: The geographic region from which the user activity originated, derived from their IP address.
- screenResolution: The screen resolution of the user's monitor. For example, 1920x1080.
- searchTerm: The term searched by the user. For example, if the user visits /some-page.html?q=some-term, this dimension returns some-term. Automatically populated if Enhanced Measurement is enabled. Populated by the event parameter search_term.
- sessionCampaignId through sessionSourcePlatform: Various dimensions representing details about the session, including campaign ID, campaign name, Google Ads details, manual tagging details (utm parameters), session medium, and more, reflecting the source and characteristics of the session.
- shippingTier: The shipping tier (e.g., Ground, Air, Next-day) selected for delivery of the purchased item. Populated by the shipping_tier event parameter.
- signedInWithUserId: The string yes if the user signed in with the User-ID feature. To learn more about User-ID, see Measure activity across platforms with User-ID.
- source: The source attributed to the conversion event.
- sourceMedium: The combined values of the dimensions source and medium.
- sourcePlatform: The source platform of the conversion events campaign. Please do not depend on this field returning Manual for traffic that uses UTMs; this field will update from returning Manual to returning (not set) for an upcoming feature launch.
- streamId: The numeric data stream identifier for your app or website.
- streamName: The data stream name for your app or website.
- testDataFilterId: The numeric identifier of a data filter in testing state. You use data filters to include or exclude event data from your reports based on event-parameter values. To learn more, see Data filters.
- testDataFilterName: The name of data filters in testing state. You use data filters to include or exclude event data from your reports based on event-parameter values. To learn more, see Data filters.
- transactionId: The ID of the ecommerce transaction.
- unifiedPagePathScreen through unifiedScreenName: Various dimensions that provide unified views of page paths, screen classes, page titles, and screen names, allowing for a combined analysis of web and app data.
- userAgeBracket: User age brackets.
- userGender: User gender.
- videoProvider: The source of the video (for example, youtube). Automatically populated for embedded videos if Enhanced Measurement is enabled. Populated by the event parameter video_provider.
- videoTitle: The title of the video. Automatically populated for embedded videos if Enhanced Measurement is enabled. Populated by the event parameter video_title.
- videoUrl: The url of the video. Automatically populated for embedded videos if Enhanced Measurement is enabled. Populated by the event parameter video_url.
- virtualCurrencyName: The name of a virtual currency with which the user is interacting. i.e., spending or purchasing gems in a game. Populated by the virtual_currency_name event parameter.
- visible: Returns true if the content is visible. Automatically populated for embedded videos if Enhanced Measurement is enabled. Populated by the event parameter visible.
- week: The week of the event, a two-digit number from 01 to 53. Each week starts on Sunday. January 1st is always in week 01. The first and last week of the year have fewer
- year: The four-digit year of the event, e.g., 2020.
- yearMonth: The combined values of year and month. Example values include 202212 or 202301.
- yearWeek: The combined values of year and week. Example values include 202253 or 202301.
`;

/**
 * Metrics Value / API Names
 */

const DefinedMetrics = `
- active1DayUsers: The number of distinct active users on your site or app within a 1 day period. The 1 day period includes the last day in the report's date range. Note: this is the same as Active Users.
- active28DayUsers: The number of distinct active users on your site or app within a 28 day period. The 28 day period includes the last day in the report's date range.
- active7DayUsers: The number of distinct active users on your site or app within a 7 day period. The 7 day period includes the last day in the report's date range.
- activeUsers: The number of distinct users who visited your site or app.
- adUnitExposure: The time that an ad unit was exposed to a user, in milliseconds.
- addToCarts: The number of times users added items to their shopping carts.
- advertiserAdClicks: Total number of times users have clicked on an ad to reach the property. Includes clicks from linked integrations like linked Search Ads 360 advertisers. Also includes uploaded clicks from data import.
- advertiserAdCost: The total amount you paid for your ads. Includes costs from linked integrations like linked Google Ads accounts. Also includes uploaded cost from data import; to learn more, see Import cost data.
- advertiserAdCostPerClick: Ads cost per click is ad cost divided by ad clicks and is often abbreviated CPC.
- advertiserAdCostPerConversion: Cost per conversion is ad cost divided by conversions.
- advertiserAdImpressions: The total number of impressions. Includes impressions from linked integrations like linked Display & Video 360 advertisers. Also includes uploaded impressions from data import.
- averagePurchaseRevenue: The average purchase revenue in the transaction group of events.
- averagePurchaseRevenuePerPayingUser: Average revenue per paying user (ARPPU) is the total purchase revenue per active user that logged a purchase event. The summary metric is for the time period selected.
- averagePurchaseRevenuePerUser: The average purchase revenue per active user is the total purchase revenue per active user that logged any event. The summary metric is for the time period selected.
- averageRevenuePerUser: Average revenue per active user (ARPU). The summary metric is for the time period selected. ARPU uses Total Revenue and includes AdMob estimated earnings.
- averageSessionDuration: The average duration (in seconds) of users' sessions.
- bounceRate: The percentage of sessions that were not engaged ((Sessions Minus Engaged sessions) divided by Sessions). This metric is returned as a fraction; for example, 0.2761 means 27.61% of sessions were bounces.
- cartToViewRate: The number of users who added a product(s) to their cart divided by the number of users who viewed the same product(s). This metric is returned as a fraction; for example, 0.1132 means 11.32% of users who viewed a product also added the same product to their cart.
- checkouts: The number of times users started the checkout process. This metric counts the occurrence of the begin_checkout event.
- cohortActiveUsers: The number of users in the cohort who are active in the time window corresponding to the cohort nth day/week/month. For example, for the row where cohortNthWeek = 0001, this metric is the number of users (in the cohort) who are active in week 1.
- cohortTotalUsers: The total number of users in the cohort. This metric is the same value in every row of the report for each cohort. Because cohorts are defined by a shared acquisition date, cohortTotalUsers is the same as cohortActiveUsers for the cohort's selection date range. For report rows later than the cohort's selection range, it is typical for cohortActiveUsers to be smaller than cohortTotalUsers. This difference represents users from the cohort that were not active for the later date. cohortTotalUsers is commonly used in the metric expression cohortActiveUsers/cohortTotalUsers to compute a user retention fraction for the cohort. The relationship between activeUsers and totalUsers is not equivalent to the relationship between cohortActiveUsers and cohortTotalUsers.
- conversions: The count of conversion events. Events are marked as conversions at collection time; changes to an event's conversion marking apply going forward. You can mark any event as a conversion in Google Analytics, and some events (i.e., first_open, purchase) are marked as conversions by default. To learn more, see About conversions.
- crashAffectedUsers: The number of users that logged a crash in this row of the report. For example, if the report is a time series by date, this metrics reports total users with at least one crash on this date. Crashes are events with the name "app_exception".
- crashFreeUsersRate: The number of users without crash events (in this row of the report) divided by the total number of users. This metric is returned as a fraction; for example, 0.9243 means 92.43% of users were crash-free.
- dauPerMau: The rolling percent of 30-day active users who are also 1-day active users. This metric is returned as a fraction; for example, 0.113 means 11.3% of 30-day active users were also 1-day active users.
- dauPerWau: The rolling percent of 7-day active users who are also 1-day active users. This metric is returned as a fraction; for example, 0.082 means 8.2% of 7-day active users were also 1-day active users.
- ecommercePurchases: The number of times users completed a purchase. This metric counts purchase events; this metric does not count in_app_purchase and subscription events.
- engagedSessions: The number of sessions that lasted longer than 10 seconds, or had a conversion event, or had 2 or more screen views.
- engagementRate: The percentage of engaged sessions (Engaged sessions divided by Sessions). This metric is returned as a fraction; for example, 0.7239 means 72.39% of sessions were engaged sessions.
- eventCount: The count of events.
- eventCountPerUser: The average number of events per user (Event count divided by Active users).
- eventValue: The sum of the event parameter named value.
- eventsPerSession: The average number of events per session (Event count divided by Sessions).
- firstTimePurchaserConversionRate: The percentage of active users who made their first purchase. This metric is returned as a fraction; for example, 0.092 means 9.2% of active users were first-time purchasers.
- firstTimePurchasers: The number of users that completed their first purchase event.
- firstTimePurchasersPerNewUser: The average number of first-time purchasers per new user.
- grossItemRevenue: The total revenue from items only. Gross item revenue is the product of its price and quantity. Item revenue excludes tax and shipping values; tax & shipping values are specified at the event and not item level. Gross item revenue does not include refunds.
- grossPurchaseRevenue: The sum of revenue from purchases made in your app or site. Gross purchase revenue sums the revenue for these events: purchase, ecommerce_purchase, in_app_purchase, app_store_subscription_convert, and app_store_subscription_renew. Purchase revenue is specified by the value parameter in tagging.
- itemDiscountAmount: The monetary value of item discounts in eCommerce events. This metric is populated in tagging by the discount item parameter.
- itemListClickEvents: The number of times users clicked an item when it appeared in a list. This metric counts the occurrence of the select_item event.
- itemListClickThroughRate: The number of users who selected a list(s) divided by the number of users who viewed the same list(s). This metric is returned as a fraction; for example, 0.2145 means 21.45% of users who viewed a list also selected the same list.
- itemListViewEvents: The number of times the item list was viewed. This metric counts the occurrence of the view_item_list event.
- itemPromotionClickThroughRate: The number of users who selected a promotion(s) divided by the number of users who viewed the same promotion(s). This metric is returned as a fraction; for example, 0.1382 means 13.82% of users who viewed a promotion also selected the promotion.
- itemRefundAmount: Item refund amount is the total refunded transaction revenue from items only. Item refund amount is the product of price and quantity for the refund event.
- itemRevenue: The total revenue from purchases minus refunded transaction revenue from items only. Item revenue is the product of its price and quantity. Item revenue excludes tax and shipping values; tax & shipping values are specified at the event and not item level.
- itemViewEvents: The number of times the item details were viewed. The metric counts the occurrence of the view_item event.
- itemsAddedToCart: The number of units added to cart for a single item. This metric counts the quantity of items in add_to_cart events.
- itemsCheckedOut: The number of units checked out for a single item. This metric counts the quantity of items in begin_checkout events.
- itemsClickedInList: The number of units clicked in list for a single item. This metric counts the quantity of items in select_item events.
- itemsClickedInPromotion: The number of units clicked in promotion for a single item. This metric counts the quantity of items in select_promotion.
- itemsPurchased: The number of units for a single item included in purchase events. This metric counts the quantity of items in purchase events.
- itemsViewed: The number of units viewed for a single item. This metric counts the quantity of items in view_item events.
- itemsViewedInList: The number of units viewed in list for a single item. This metric counts the quantity of items in view_item_list events.
- itemsViewedInPromotion: The number of units viewed in promotion for a single item. This metric counts the quantity of items in view_promotion events.
- newUsers: The number of users who interacted with your site or launched your app for the first time (event triggered: first_open or first_visit).
- organicGoogleSearchAveragePosition: The average ranking of your website URLs for the query reported from Search Console. This metric requires an active Search Console link.
- organicGoogleSearchClickThroughRate: The organic Google Search click through rate reported from Search Console. This metric is returned as a fraction; this metric requires an active Search Console link.
- organicGoogleSearchClicks: The number of organic Google Search clicks reported from Search Console. This metric requires an active Search Console link.
- organicGoogleSearchImpressions: The number of organic Google Search impressions reported from Search Console. This metric requires an active Search Console link.
- promotionClicks: The number of times an item promotion was clicked. This metric counts the occurrence of the select_promotion event.
- promotionViews: The number of times an item promotion was viewed. This metric counts the occurrence of the view_promotion event.
- publisherAdClicks: The number of ad_click events.
- publisherAdImpressions: The number of ad_impression events.
- purchaseRevenue: The sum of revenue from purchases minus refunded transaction revenue made in your app or site. This metric sums the revenue for these events: purchase, ecommerce_purchase, in_app_purchase, app_store_subscription_convert, and app_store_subscription_renew.
- purchaseToViewRate: The number of users who purchased a product(s) divided by the number of users who viewed the same product(s). This metric is returned as a fraction; for example, 0.128 means 12.8% of users that viewed a product(s) also purchased the same product(s).
- purchaserConversionRate: The percentage of active users who made 1 or more purchase transactions. This metric is returned as a fraction; for example, 0.412 means 41.2% of users were purchasers.
- refundAmount: The total refunded transaction revenues. Refund amount sums refunded revenue for the refund and app_store_refund events.
- returnOnAdSpend: Return On Ad Spend (ROAS) is total revenue divided by advertiser ad cost.
- screenPageViews: The number of app screens or web pages your users viewed. Repeated views of a single page or screen are counted. (screen_view + page_view events).
- screenPageViewsPerSession: The number of app screens or web pages your users viewed per session. Repeated views of a single page or screen are counted. (screen_view + page_view events) / sessions.
- screenPageViewsPerUser: The number of app screens or web pages your users viewed per active user. Repeated views of a single page or screen are counted. (screen_view + page_view events) / active users.
- scrolledUsers: The number of unique users who scrolled down at least 90% of the page.
- sessionConversionRate: The percentage of sessions in which any conversion event was triggered.
- sessions: The number of sessions that began on your site or app (event triggered: session_start).
- sessionsPerUser: The average number of sessions per user (Sessions divided by Active Users).
- shippingAmount: Shipping amount associated with a transaction. Populated by the shipping event parameter.
- taxAmount: Tax amount associated with a transaction. Populated by the tax event parameter.
- totalAdRevenue: The total advertising revenue from both Admob and third-party sources.
- totalPurchasers: The number of users that logged purchase events for the time period selected.
- totalRevenue: The sum of revenue from purchases, subscriptions, and advertising (Purchase revenue plus Subscription revenue plus Ad revenue) minus refunded transaction revenue.
- totalUsers: The number of distinct users who have logged at least one event, regardless of whether the site or app was in use when that event was logged.
- transactions: The count of transaction events with purchase revenue. Transaction events are in_app_purchase, ecommerce_purchase,
- transactionsPerPurchaser: The average number of transactions per purchaser.
- userConversionRate: The percentage of users who triggered any conversion event.
- userEngagementDuration: The total amount of time (in seconds) your website or app was in the foreground of users' devices.
- wauPerMau: The rolling percent of 30-day active users who are also 7-day active users. This metric is returned as a fraction; for example, 0.234 means 23.4% of 30-day active users were also 7-day active users.
`;
