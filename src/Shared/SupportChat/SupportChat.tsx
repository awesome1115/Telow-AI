/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Stripe from 'stripe';
import './SupportChat.scss';
import Hex from 'crypto-js/enc-hex';
import { HmacSHA256 } from 'crypto-js';

interface SupportChatProps {
  user?: User;
}

declare global {
  interface Window {
    chatwootSettings: any;
    chatwootSDK: any;
    $chatwoot: any;
  }
}

const SupportChat: FC<SupportChatProps> = ({ user }) => {
  const [s, setS] = useState<Stripe>();
  const [stripeAccount, setStripeAccount] = useState<Stripe.Account>();

  useEffect(() => {
    if (
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
      import.meta.env.VITE_STRIPE_SECRET_KEY
    ) {
      setS(
        new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
          apiVersion: '2023-08-16',
        })
      );
    }
  }, []);

  useEffect(() => {
    const getStripeAccount = async () => {
      const checkStripeUser = await s?.customers.list({
        email: user?.email,
      });
      if (checkStripeUser?.data.length) {
        try {
          if (s) {
            const sCustomer = await s.customers.retrieve(
              checkStripeUser?.data[0]?.id
            );
            setStripeAccount(sCustomer as unknown as Stripe.Account);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    getStripeAccount();
  }, [s, user?.email]);

  useEffect(() => {
    if (user && stripeAccount) {
      window.chatwootSettings = {
        hideMessageBubble: false,
        position: 'left',
        locale: 'en',
        type: 'standard',
      };

      window.addEventListener('chatwoot:ready', () => {
        if (import.meta.env.VITE_HMAC && user?.id) {
          const identifierHash = HmacSHA256(
            user!.id,
            import.meta.env.VITE_HMAC as string
          );
          const hmacDigest = Hex.stringify(identifierHash);

          window.$chatwoot.setUser(user?.id, {
            email: user?.email,
            name: `${user?.given_name} ${user?.family_name}`,
            avatar_url: user?.picture,
            phone_number: user?.phone_number,
            identifier_hash: hmacDigest,
          });

          window.$chatwoot.setCustomAttributes({
            stripe_id: stripeAccount.id,
          });
        }
      });

      (function (d: any, t: any) {
        const BASE_URL = 'https://agent.telow.com';
        const g = d.createElement(t);
        const s = d.getElementsByTagName(t)[0];
        g.src = `${BASE_URL}/packs/js/sdk.js`;
        g.defer = true;
        g.async = true;
        s.parentNode?.insertBefore(g, s);

        g.onload = function () {
          window.chatwootSDK.run({
            websiteToken: import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN,
            baseUrl: BASE_URL,
          });
        };
      })(document, 'script');
    }
  }, [stripeAccount, user]);

  return null;
};

export default SupportChat;

interface User {
  id: string;
  email: string;
  preferred_username: string;
  email_verified: boolean;
  signup_methods: string;
  given_name?: string | null;
  family_name?: string | null;
  middle_name?: string | null;
  nickname?: string | null;
  picture?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  phone_number?: string | null;
  phone_number_verified?: boolean | null;
  roles?: string[];
  created_at: number;
  updated_at: number;
  is_multi_factor_auth_enabled?: boolean;
}
