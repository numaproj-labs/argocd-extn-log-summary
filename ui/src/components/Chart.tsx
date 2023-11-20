import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  Legend,
  ReferenceLine,
} from "recharts";
import Tippy from "@tippy.js/react";
import * as moment from "moment";
import "./Chart.scss";
import * as React from "react";

const height = 150;

export const colorArray = ["#d7d8d9", "#f4c030", "#e76d75", "#343a40"];

export const roundNumber = (num: number, dig: number): number => {
  return Math.round(num * 10 ** dig) / 10 ** dig;
};

const truncate = (str: string, n: number): string => {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className=" ls-relative ls-bg-dark ls-min-w-[130px] ls-opacity-90 ls-text-light ls-p-[12px] ls-px-[18px] ls-rounded-lg ls-shadow-lx ls-uppercase">
        <div className=" ls-font-semibold ls-pb-1">
          {moment(payload?.[0]?.payload?.x * 1000).format("HH:mm A")}
        </div>
        {payload.map((p: any) => {
          return (
            <div className=" ls-flex ls-items-center ls-gap-3" key={p}>
              {p.name == "info" && (
                <div className=" ls-relative ls-h-[12px] !ls-min-w-[12px] ls-overflow-hidden ls-rounded-full ls-bg-gray !ls-border-[2px] !ls-border-dark/20 "></div>
              )}
              {p.name == "warn" && (
                <div className=" ls-relative ls-h-[12px] !ls-min-w-[12px] ls-overflow-hidden ls-rounded-full ls-bg-warning !ls-border-[2px] !ls-border-dark/20 "></div>
              )}
              {p.name == "error" && (
                <div className=" ls-relative ls-h-[12px] !ls-min-w-[12px] ls-overflow-hidden ls-rounded-full ls-bg-danger !ls-border-[2px] !ls-border-dark/20 "></div>
              )}

              {p.name == "fatal" && (
                <div className=" ls-relative ls-h-[12px] !ls-min-w-[12px] ls-overflow-hidden ls-rounded-full ls-bg-[#000] !ls-border-[1px] !ls-border-light/20 "></div>
              )}
              <div
                style={{
                  borderBottom: `2px ${
                    p.strokeDasharray ? "dashed" : "solid"
                  } ${p.stroke}`,
                  width: "18px",
                  height: "8px",
                }}
              ></div>
              <strong>{p.name}</strong>

              <div className=" ls-ml-auto">{`${(
                Math.round(p.payload.y * 100) / 100
              ).toFixed(2)}`}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};


const RenderLegend = ({
  payload,
  metric,
  setHighlight,
  highlight,
  groupBy,
}: any) => {

  return (
    <div className="metrics-charts__legend_wrapper box-arrow-top">
      <div>
        <span className="metrics-charts__legend_title">
          <span id={`labelId_${metric}`} />
        </span>
      </div>
      <div className="legend-content">
        {payload?.map((entry: any, index: any) => (
          <div key={entry + index} style={{ display: "flex" }}>
            <div
              style={{ padding: "3px 8px 0 0" }}
              key={`legend_${JSON.stringify(entry)}`}
              className={`l-content`}
              onMouseOver={() => {
                setHighlight({ ...highlight, [groupBy]: entry.value });
              }}
            >
              <div>
                <svg
                  style={{ margin: ".3em .5em .2em 0px" }}
                  height="5"
                  width="30"
                >
                  <line
                    x1="0"
                    x2="30"
                    stroke={`${entry.payload.stroke}`}
                    strokeWidth="5"
                    strokeDasharray={`${entry.payload.strokeDasharray}`}
                  />
                </svg>
              </div>
              <div className="legendLink">{truncate(entry.value, 56)}</div>
            </div>
            <div
              className={`metrics-charts__value`}
              id={`valueId_${metric}_${entry.value}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderEventContent = ({ viewBox: { x, y } }: any, event: any) => {
  const d: number = 20;
  const r = d / 2;
  const transform = `translate(${x - r - 0} ${y - d - 10})`;
  return (
    <Tippy
      arrow={true}
      duration={0.1}
      content={
        <div className="metrics-charts__tooltip_wrapper">
          <div className="metrics-charts__tooltip_title">Event Sample</div>
          <div>{event}</div>
        </div>
      }
    >
      <g
        transform={transform}
        id="Page-1"
        stroke="none"
        strokeWidth="1"
        fill="none"
        opacity={0.7}
        fillRule="evenodd"
      >
        <g id="Artboard" transform="translate(-146.000000, -450.000000)">
          <g id="Group-3" transform="translate(146.000000, 450.000000)">
            <circle
              id="Oval"
              fillOpacity="0"
              fill="#DCE4E9"
              cx="10"
              cy="13"
              r="10"
            ></circle>
            <path
              d="M14.1374778,0.111235423 C14.3939821,0.301091482 14.5138005,0.691963646 14.4263758,1.05368004 L12.1342818,10.5626212 L16.3633925,10.5626212 C16.6174101,10.562492 16.8471545,10.7552566 16.947851,11.053005 C17.0485474,11.3507534 17.0009036,11.6964404 16.8266475,11.9324157 L6.64521947,25.744104 C6.44236362,26.0195174 6.11752274,26.0798823 5.86159296,25.8897246 C5.60566318,25.6995669 5.48628993,25.3091476 5.57362417,24.9479008 L7.86571815,15.4373347 L3.63660749,15.4373347 C3.38258987,15.437464 3.15284548,15.2446993 3.05214904,14.9469509 C2.9514526,14.6492025 2.99909639,14.3035156 3.17335251,14.0675402 L13.3547805,0.255851925 C13.5573747,-0.0191650541 13.8816564,-0.0797547875 14.1374778,0.109610519 L14.1374778,0.111235423 Z"
              id="Path"
              fill="#8DA8B8"
              fillRule="nonzero"
            ></path>
          </g>
        </g>
      </g>
    </Tippy>
  );
};

export const TimeSeriesChart = ({
  chartData = [],
  altChartData = [],
  title = "",
  ticks,
  altTicks,
  domain = ["dataMin", "dataMax"],
  yUnit = "",
  altyUnit = "",
  valueRounding = 10,
  labelKey = "",
  altLabelKey = "",
  events = [],
}: any) => {
  const LegendMemo = useMemo(() => {
    return (
      <Legend
        layout="horizontal"
        content={<RenderLegend chartHeight={50} labelKey={labelKey} />}
      />
    );
  }, [labelKey]);

  const YAxisMemo = useMemo(() => {
    return (
      <YAxis
        unit={yUnit ? ` ${yUnit}` : ``}
        tickFormatter={(y: any) => roundNumber(y, valueRounding) + ``}
        tickSize={0}
        tickMargin={8}
        ticks={ticks}
        style={{ fontSize: ".9em" }}
        domain={domain}
      >
        <Label
          className={"chartYLabel"}
          style={{ textAnchor: "middle" }}
          value={labelKey}
          offset={0}
          angle={-90}
          position="left"
        />
      </YAxis>
    );
  }, [chartData]);

  const AltYAxisMemo = useMemo(() => {
    return (
      <YAxis
        unit={altyUnit ? ` ${altyUnit}` : ``}
        tickFormatter={(y: any) => roundNumber(y, valueRounding) + ``}
        tickSize={0}
        tickMargin={8}
        ticks={altTicks}
        orientation="right"
        yAxisId="right"
        domain={domain}
        style={{ fontSize: ".9em" }}
      >
        <Label
          className={"chartYLabel"}
          style={{ textAnchor: "middle" }}
          value={altLabelKey}
          offset={0}
          angle={90}
          position="right"
        />
      </YAxis>
    );
  }, [altChartData]);

  const XAxisMemo = useMemo(() => {
    return (
      <XAxis
        dataKey="x"
        domain={["dataMin", "dataMax"]}
        name="Time"
        tickSize={0}
        tickMargin={8}
        tickCount={8}
        allowDuplicatedCategory={false}
        style={{ fontSize: ".9em" }}
        tickFormatter={(unixTime: number) =>
          moment(unixTime * 1000).format("HH:mm")
        }
        type="number"
      />
    );
  }, []);

  return useMemo(
    () => (
      <>
        <div style={{ display: "block", width: "100%" }}>
          <div>
            <strong>{title}</strong>
          </div>
          <ResponsiveContainer debounce={150} width="100%" height={height}>
            <LineChart
              width={800}
              height={500}
              syncId={"o11yCharts"}
              syncMethod={"value"}
              layout={"horizontal"}
              onMouseMove={(e: any) => {}}
              onClick={(d: any) => {
                const id = moment.unix(d.activeLabel).format("HH:mmA");
                const idContainer = `${moment
                  .unix(d.activeLabel)
                  .format("HH:mmA")}-container`;

                const idContainerElem = document.getElementById(idContainer);
                const targetElement = document.getElementById(id);

                // Scroll smoothly to the target element
                targetElement.scrollIntoView({
                  behavior: "smooth",
                  inline: "nearest",
                });
                // const scrollContainer = document.getElementsByClassName('sliding-panel__body')
                // scrollContainer?.[0]?.scrollBy(0, 200);
                idContainerElem.style.transition = ".7s ease";
                setTimeout(() => {
                  idContainerElem.style.backgroundColor = "#FFA50055";
                }, 500);

                setTimeout(() => {
                  idContainerElem.style.backgroundColor = "#fff";
                }, 1500);
              }}
              margin={{
                top: 30,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {Object.keys(events)?.map((eventKey: any, i: number) => {
                const event = events[eventKey];
                if (!eventKey || !event) {
                  return;
                }

                return (
                  <ReferenceLine
                    key={eventKey + i}
                    isFront
                    x={moment(eventKey * 1000).unix()}
                    stroke="#e96d7666"
                    strokeWidth={1}
                    strokeDasharray={"3 2"}
                    label={
                      <Label
                        position="center"
                        content={(p: any) => renderEventContent(p, event)}
                      />
                    }
                  />
                );
              })}
              {XAxisMemo}
              {YAxisMemo}
              {altChartData.length && AltYAxisMemo}
              <Tooltip
                animationDuration={50}
                allowEscapeViewBox={{ x: false, y: true }}
                content={<CustomTooltip />}
              />
              {altChartData?.map((d: any, i: number) => {
                return (
                  <Line
                    isAnimationActive={false}
                    dataKey="y"
                    data={d.data}
                    connectNulls={false}
                    stroke={d.color || colorArray[i % colorArray.length]}
                    strokeWidth={1.5}
                    yAxisId="right"
                    name={d.name}
                    dot={false}
                    key={d.name}
                    animationDuration={200}
                    style={{ zIndex: 1 }}
                  />
                );
              })}
              {chartData?.map((d: any, i: number) => {
                return (
                  <Line
                    isAnimationActive={false}
                    dataKey="y"
                    data={d.data}
                    connectNulls={false}
                    stroke={d.color || colorArray[i % colorArray.length]}
                    strokeWidth={1.5}
                    name={d.name}
                    dot={false}
                    key={d.name}
                    animationDuration={200}
                    style={{ zIndex: 1 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    ),
    [title, XAxisMemo, YAxisMemo, LegendMemo, chartData]
  );
};

export default TimeSeriesChart;
