import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import AccessibilityModule from 'highcharts/modules/accessibility';
import HighchartsReact from 'highcharts-react-official';
import { Card, CardBody, Text } from '@chakra-ui/react';
import _ from 'lodash';
import moment from 'moment';
import { Bug } from '../../../../../../API/Model/BugsModel';

AccessibilityModule(Highcharts);

interface HistoryChartProps {
  chartHeader?: boolean;
  data?: Bug[];
}

const HistoryChart: FC<HistoryChartProps> = ({ chartHeader, data }) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [selectedRange] = useState('1m');
  const [options, setOptions] = useState<Highcharts.Options>({});
  const [isLoading, setIsLoading] = useState(true);

  const updateChartRange = useCallback((range: string) => {
    const now = moment();
    let min: number | undefined;
    const max: number = now.valueOf(); // Current time in milliseconds
    let dateTimeLabelFormat:
      | Highcharts.AxisDateTimeLabelFormatsOptions
      | undefined;

    switch (range) {
      case '24h':
        min = now.subtract(24, 'hours').valueOf();
        dateTimeLabelFormat = { hour: '%H:%M', minute: '%H:%M' }; // Format for hours and minutes
        break;
      case '7d':
      case '2w':
        min =
          range === '7d'
            ? now.subtract(7, 'days').valueOf()
            : now.subtract(2, 'weeks').valueOf();
        dateTimeLabelFormat = { day: '%e. %b' }; // Format for days
        break;
      case '1m':
        min = now.subtract(1, 'month').valueOf();
        dateTimeLabelFormat = { day: '%e. %b' }; // Format for days
        break;
      default:
        min = undefined;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dateTimeLabelFormat = { month: "%b '%y", year: '%Y' }; // Default format for months
        break;
    }

    setOptions((prevOptions) => {
      const xAxisOptions = Array.isArray(prevOptions.xAxis)
        ? prevOptions.xAxis[0]
        : prevOptions.xAxis || {};

      return {
        ...prevOptions,
        xAxis: {
          ...xAxisOptions,
          min,
          max,
          lineWidth: 1,
        },
      };
    });

    if (chartComponentRef.current) {
      chartComponentRef.current.chart.update(options);
      chartComponentRef.current.chart.redraw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data) return;

    const errorsByDate = _(data)
      .groupBy((bug) =>
        moment(bug.created_at).startOf('day').format('YYYY-MM-DD')
      ) // Group by month
      .map((bugs, date) => ({
        x: moment(date).valueOf(), // x-value: timestamp at the start of the month
        y: bugs.length, // y-value: count of errors
      }))
      .orderBy(['x'], ['asc']) // Make sure the data is sorted by date
      .value();

    setOptions({
      chart: {
        type: 'spline',
        backgroundColor: 'transparent',
        height: '150px',
      },
      title: {
        text: chartHeader ? 'Bug History' : '',
        align: 'left',
      },
      subtitle: {
        text: chartHeader ? 'This chart tracks the history of bugs.' : '',
        align: 'left',
      },
      navigator: {
        enabled: true,
      },
      rangeSelector: {
        enabled: true,
        buttons: [
          {
            type: 'day',
            count: 1,
            text: '1d',
          },
          {
            type: 'week',
            count: 1,
            text: '1w',
          },
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
        selected: 3, // Default to 'All'
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          month: "%b '%y",
          year: '%Y',
        },
        tickWidth: 0,
        lineWidth: 0,
        gridLineWidth: 0,
        lineColor: '#FFFFFF',
        labels: {
          style: {
            color: '#FFFFFF',
          },
        },
      },
      yAxis: {
        gridLineWidth: 0,
        title: {
          text: '',
        },
        labels: {
          style: {
            color: '#FFFFFF',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Set the background color to white
        borderColor: 'gray', // Set the border color
        borderRadius: 6, // Set the border radius for rounded corners
        borderWidth: 0, // Set the border width
        shadow: false,
        style: {
          color: '#FFFFFF', // Set the text color
        },
        useHTML: true, // Allows HTML in formatter
        formatter() {
          /* eslint-disable */
          return `
            <div style="padding: 10px;">
              <span style="font-size: 10px;">${Highcharts.dateFormat('%A, %b %e, %Y', Number(this.x))}</span><br/>
              <span style="font-size: 16px; font-weight: bold;">${this.y} bugs</span>
            </div>
          `;
          /* eslint-enable */
        },
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false,
          },
          lineWidth: 2, // Adjust line width to match the desired thickness
          states: {
            hover: {
              lineWidth: 3,
            },
          },
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: [
        {
          type: 'spline',
          name: 'Error Count',
          data: errorsByDate,
          color: '#FFFFFF',
        },
      ],
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    });

    updateChartRange(selectedRange);
    setIsLoading(false);
  }, [chartHeader, data, selectedRange, updateChartRange]);

  useEffect(() => {
    updateChartRange(selectedRange);
  }, [selectedRange, updateChartRange]);

  return (
    <Card background="#0D0D0D" color="white" mx={3}>
      <CardBody>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartComponentRef}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default HistoryChart;
