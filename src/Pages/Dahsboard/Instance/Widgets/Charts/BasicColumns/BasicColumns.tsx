import React, { FC, useMemo, useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import more from 'highcharts/highcharts-more';
import variablePie from 'highcharts/modules/variable-pie';
import {
  Box,
  Text,
  Center,
  Spinner,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Badge,
} from '@chakra-ui/react';
import './BasicColumns.scss';
import { CiCircleInfo } from 'react-icons/ci';

more(Highcharts);
variablePie(Highcharts);

type TransformedRow = {
  dimensions: Record<string, string>;
  metrics: Record<string, string>;
};

interface BasicColumnsProps {
  data: TransformedRow[];
  title: string;
  description: string;
}

const BasicColumns: FC<BasicColumnsProps> = ({ data, title, description }) => {
  const [isLoading, setIsLoading] = useState(true); // State to track loading status

  const hexToRgba = (hex: string, opacity: number) => {
    let r = 0;
    let g = 0;
    let b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const hoverColors = [
    '#8C2A58',
    '#2B2B2B',
    '#3F768C',
    '#4694A6',
    '#2DA64B',
    '#164773',
    '#0B2B40',
    '#1E5959',
    '#3B8C6E',
    '#89D99D',
    '#FFAE00',
    '#634A00',
    '#383416',
    '#0C7D74',
    '#0F353D',
  ];

  const transformDataToSeries = (tData: TransformedRow[]) => {
    if (tData.length === 0) return [];

    const sampleItem = tData[0];
    const dimensionKeys = Object.keys(sampleItem.dimensions);
    const metricKeys = Object.keys(sampleItem.metrics);

    const primaryDimensionKey = dimensionKeys[0];

    const yMetricKey = metricKeys[0];
    const zMetricKey = metricKeys[1] || metricKeys[0];

    const aggregatedData = data.reduce<{
      [key: string]: { [key: string]: number };
    }>((acc, item) => {
      const dimensionValue = item.dimensions[primaryDimensionKey] || 'Unknown';
      if (!acc[dimensionValue]) {
        acc[dimensionValue] = metricKeys.reduce<{ [key: string]: number }>(
          (metricsAcc, key) => {
            return { ...metricsAcc, [key]: 0 };
          },
          {}
        );
      }

      metricKeys.forEach((metricKey) => {
        const metricValue = parseFloat(item.metrics[metricKey]) || 0;
        acc[dimensionValue][metricKey] += metricValue;
      });

      return acc;
    }, {});

    const seriesData = Object.entries(aggregatedData).map(([name, metrics]) => {
      const dataPoint: {
        states: { hover: { color: string } };
        color: string;
        name: string;
        y: number;
        z?: number;
      } = {
        name,
        y: metrics[yMetricKey],
        ...metrics,
        color: '',
        states: {
          hover: {
            color: '',
          },
        },
      };
      if (zMetricKey !== yMetricKey) {
        dataPoint.z = metrics[zMetricKey];
      }
      return dataPoint;
    });

    return [
      {
        minPointSize: 10,
        innerSize: '20%',
        zMin: 0,
        name: 'Data',
        showInLegend: true,
        data: seriesData,
      },
    ];
  };

  const generateTooltipFormat = (metricKeys: string[]) => {
    return metricKeys
      .map((metricKey) => {
        const formattedMetricName = metricKey
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str: string) => str.toUpperCase())
          .trim();
        return `<span><span style="color: {point.color}">\u25CF</span> ${formattedMetricName}: <b>{point.${metricKey}}</b></span><br/>`;
      })
      .join('');
  };

  const chartOptions = useMemo(() => {
    const allMetricKeys = Array.from(
      new Set(
        data.flatMap((item: { metrics: object }) => Object.keys(item.metrics))
      )
    );

    const transformedSeries = transformDataToSeries(data);

    transformedSeries.forEach((series) => {
      series.data.forEach((point, pointIndex) => {
        const baseColor = hoverColors[pointIndex % hoverColors.length]; // Cycle through colors array
        // eslint-disable-next-line no-param-reassign
        point.color = hexToRgba(baseColor, 0.5);

        const hoverColor = hexToRgba(baseColor, 1);
        // eslint-disable-next-line no-param-reassign
        point.states = {
          hover: {
            color: hoverColor,
          },
        };
      });
    });

    return {
      chart: {
        type: 'variablepie',
        width: 300,
        height: 300,
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
      },
      tooltip: {
        useHTML: true,
        headerFormat:
          '<h4 style="font-size: 18px; margin-bottom: 5px">{point.key}</h4>',
        pointFormat: generateTooltipFormat(allMetricKeys),
      },
      plotOptions: {
        variablepie: {
          dataLabels: {
            enabled: false,
          },
          states: {
            hover: {
              enabled: true,
              brightness: 0.5,
              halo: {
                size: 10,
              },
            },
          },
        },
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      series: transformedSeries,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hoverColors]);

  useEffect(() => {
    if (data.length > 0) setIsLoading(false);
  }, [data]);
  return (
    <Box pb={3}>
      <Text fontSize="1.25rem" color="#fff" className="title">
        {isLoading ? (
          <Spinner margin="auto" size="md" />
        ) : (
          <Box>
            {title} <Badge variant="outline">GenAI</Badge>
          </Box>
        )}
      </Text>

      <Popover trigger="hover" placement="right">
        <PopoverTrigger>
          <Text
            fontSize="0.75rem"
            color="#fff"
            display="flex"
            alignItems="center"
          >
            <CiCircleInfo />
            <Box ml={1}>Generative AI</Box>
          </Text>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody fontSize="0.70rem">{description}</PopoverBody>
        </PopoverContent>
      </Popover>
      {isLoading ? (
        <Center w="100%" py="5" color="#fff">
          <Spinner size="md" />
          <Text fontSize="0.65rem" color="#fff" ml="3">
            GenAI | Generating AI base chart.
          </Text>
        </Center>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      )}
    </Box>
  );
};

export default BasicColumns;
