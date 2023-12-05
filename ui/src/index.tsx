import * as React from "react";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import "./styles.css";
import axios from "axios";
import { Tooltip } from "./utils/Tooltip";
import moment from "moment";
import TimeSeriesChart from "./components/Chart";
import { NumaLogo } from "./images/NumaLogo";
import { EventIcon } from "./images/EventIcon";

export const roundNumber = (num: number, dig: number): number => {
  return Math.round(num * 10 ** dig) / 10 ** dig;
};

interface LogData {
  timestamp: number;
  overall_numbers: {
    info: number;
    error: number;
    warn: number;
    fatal: number;
  };
  log_clusters: [LogCluster];
  typical_logs: {
    info: string;
    error: string;
    warn: string;
    fatal: string;
  };
  metric_scores: {
    namespace_app_rollouts_http_request_error_rate: number;
    namespace_app_rollouts_unified_anomaly: number;
  };
  event_sample: string;
  brief_summary: string;
  model_type: string;
}

interface LogCluster {
  log: string;
  log_count: number;
  type: string;
}

const levelLabelStyle: CSSProperties = {
  minWidth: "110px",
  textTransform: "uppercase",
};

const levelLogMsg: CSSProperties = {
  whiteSpace: "pre-wrap",
};

const levelRows: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "1em",
  borderBottom: "1px rgba(0,0,0,.2)",
  marginBottom: ".25em",
  paddingBottom: ".25em",
};

const LogClusterMessasges = ({
  logCluster,
  label,
}: {
  logCluster: LogCluster[];
  label: string;
}) => {
  const clusters = logCluster?.filter((l) => l.type == label);
  if (clusters.length < 1) {
    return <div>No {label} logs</div>;
  }
  return (
    <div>
      {clusters?.map((l, i) => {
        return (
          <div
            key={JSON.stringify(l)}
            className={` ${i > 0 ? " ls-mt-3" : ""}`}
          >
            {l.log}
          </div>
        );
      })}
    </div>
  );
};

export const Extension = (props: any) => {
  const { resource: initialResource, application: initialApp } = props;
  const [logs, setLogs] = useState<LogData[]>(null);
  const [anomalyMetricChartData, setAnomalyMetricChartData] = useState<any>([]);
  const [errorRateMetricChartData, setErrorRateMetricChartData] = useState<any>(
    []
  );
  const [resource, setResource] = useState<any>({});
  const [application, setApplication] = useState<any>({});
  const [events, setEvents] = useState<any>({});
  const [appName, setAppName] = useState<string>("");
  const [resName, setResName] = useState<string>("");
  const [namespace, setNamespace] = useState<string>("");
  const [resNamespace, setResNamespace] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(60);
  const [lookback, setLookback] = useState<number>(3600);

  const [loading, setLoading] = useState<boolean>(false);
  const timerElem = useRef<HTMLDivElement>(null);
  const chartRef = useRef(null);
  const scrollRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    if (logs?.length) {
      const info: any = { name: "info", data: [] };
      const warn: any = { name: "warn", data: [] };
      const error: any = { name: "error", data: [] };
      const fatal: any = { name: "fatal", data: [] };
      const chartEvents: any = {};
      logs.map((log: LogData) => {
        info.data.push({ x: log.timestamp, y: log.overall_numbers.info || 0 });
        warn.data.push({ x: log.timestamp, y: log.overall_numbers.warn || 0 });
        error.data.push({
          x: log.timestamp,
          y: log.overall_numbers.error || 0,
        });
        fatal.data.push({
          x: log.timestamp,
          y: log.overall_numbers.fatal || 0,
        });
        chartEvents[log.timestamp] = log.event_sample;
      });
      setEvents(chartEvents);
    }
  }, [logs]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          if (chartRef.current) {
            chartRef.current.style.position = "fixed";
            chartRef.current.style.top = "-30px";
          }
          if (padRef.current) {
            padRef.current.style.height = "200px";
          }
        } else {
          if (chartRef.current) {
            chartRef.current.style.position = "relative";
            chartRef.current.style.top = "0px";
          }
          if (padRef.current) {
            padRef.current.style.height = "0px";
          }
        }
      });
    });

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => {
      if (scrollRef.current) {
        observer.unobserve(scrollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setResource(initialResource);
  }, [initialResource]);

  useEffect(() => {
    setApplication(initialApp);
  }, [initialApp]);

  useEffect(() => {
    setAppName(application?.metadata?.name || "");
  }, [application]);

  useEffect(() => {
    setResName(resource?.metadata?.name || "");
  }, [resource]);

  useEffect(() => {
    setProject(initialApp?.spec?.project || "default");
  }, []);

  useEffect(() => {
    setNamespace(initialApp?.metadata?.namespace || "");
  }, [application]);

  useEffect(() => {
    setResNamespace(initialResource?.metadata?.namespace || "");
  }, [application]);

  useEffect(() => {
    if (appName && resName && resource?.kind) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const oneHourAgoInSeconds = Math.floor(Date.now() / 1000 - lookback);
      const errorUrl = `/extensions/logsummary/metrics/namespace_app_rollouts_http_request_error_rate/${resNamespace}/${resName}/${oneHourAgoInSeconds}/${currentTimeInSeconds}`;

      axios
        .get(`${errorUrl}`, {
          withCredentials: true,
          headers: {
            "Argocd-Application-Name": `${namespace}:${appName}`,
            "Argocd-Project-Name": `${project}`,
          },
        })
        .then((res: any) => {
          // setMetrics(res.data);
          const metrics: any = [];

          res?.data?.map((o: any) => {
            const metric: any = {
              name:
                o?.metric?.rollouts_pod_template_hash ||
                o?.metric?.pod ||
                o?.metric?.container ||
                o?.metric?.pod ||
                o?.metric?.service,
              data: [],
              color: "#e86d76",
            };
            o.values?.map((kv: any) => {
              metric.data.push({ x: kv[0], y: kv[1] });
            });
            metrics.push(metric);
          });

          setErrorRateMetricChartData(metrics);
        })
        .catch((error) => {
          // Handle error
        });
    }
  }, [resource, namespace, appName, lookback, logs, resNamespace]);

  useEffect(() => {
    if (appName && resName && resource?.kind) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const oneHourAgoInSeconds = Math.floor(Date.now() / 1000 - lookback);
      const anomalyUrl = `/extensions/logsummary/metrics/namespace_app_rollouts_unified_anomaly/${resNamespace}/${resName}/${oneHourAgoInSeconds}/${currentTimeInSeconds}`;

      axios
        .get(`${anomalyUrl}`, {
          withCredentials: true,
          headers: {
            "Argocd-Application-Name": `${namespace}:${appName}`,
            "Argocd-Project-Name": `${project}`,
          },
        })
        .then((res: any) => {
          // setMetrics(res.data);
          const metrics: any = [];

          res?.data?.map((o: any) => {
            const metric: any = {
              name:
                o?.metric?.rollouts_pod_template_hash ||
                o?.metric?.pod ||
                o?.metric?.container ||
                o?.metric?.pod ||
                o?.metric?.service,
              data: [],
              color: "#00A2B3",
            };
            o.values?.map((kv: any) => {
              metric.data.push({ x: kv[0], y: kv[1] });
            });
            metrics.push(metric);
          });

          setAnomalyMetricChartData(metrics);
        })
        .catch((error) => {
          // Handle error
        });
    }
  }, [resource, namespace, appName, lookback, logs, resNamespace]);

  useEffect(() => {
    if (appName && resName && resource?.kind) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const oneHourAgoInSeconds = Math.floor(Date.now() / 1000 - lookback);
      const errorUrl = `/extensions/logsummary/metrics/namespace_app_rollouts_http_request_error_rate/${resNamespace}/${resName}/${oneHourAgoInSeconds}/${currentTimeInSeconds}`;

      axios
        .get(`${errorUrl}`, {
          withCredentials: true,
          headers: {
            "Argocd-Application-Name": `${namespace}:${appName}`,
            "Argocd-Project-Name": `${project}`,
          },
        })
        .then((res: any) => {
          // setMetrics(res.data);
          const metrics: any = [];

          res?.data?.map((o: any) => {
            const metric: any = {
              name:
                o?.metric?.rollouts_pod_template_hash ||
                o?.metric?.pod ||
                o?.metric?.container ||
                o?.metric?.pod ||
                o?.metric?.service,
              data: [],
              color: "#e86d76",
            };
            o.values?.map((kv: any) => {
              metric.data.push({ x: kv[0], y: kv[1] });
            });
            metrics.push(metric);
          });
          setErrorRateMetricChartData(metrics);
        })
        .catch((error) => {
          // Handle error
        });
    }
  }, [resource, namespace, appName, lookback, logs, resNamespace]);

  const getLogs = useCallback(() => {
    if (appName && resName && resource?.kind) {
      setTimer(60);
      setLoading(true);
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const oneHourAgoInSeconds = Math.floor(Date.now() / 1000 - lookback);
      const url = `/extensions/logsummary/data/${resNamespace}/${resource?.kind?.toLowerCase()}/${resName}/${oneHourAgoInSeconds}/${currentTimeInSeconds}`;

      axios
        .get(`${url}`, {
          withCredentials: true,
          headers: {
            "Argocd-Application-Name": `${namespace}:${appName}`,
            "Argocd-Project-Name": `${project}`,
          },
        })
        .then((res: any) => {
          setLogs(res?.data);
          setTimeout(() => {
            setLoading(false);
          }, 900);
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  }, [resource, namespace, appName, lookback, resNamespace]);

  useEffect(() => {
    if (timerElem?.current) {
      timerElem.current.style.background = `conic-gradient(#f4c030 0%, #fafafa 0)`;
    }
    if (autoRefresh) {
      getLogs();
      const timerInterval = setInterval(() => {
        if (timerElem?.current) {
          setTimer((prev: number) => {
            const newTimer = prev - 0.5;
            if (newTimer < 1) {
              getLogs();
              timerElem.current.style.background = `conic-gradient(#f4c030 0%, #fafafa 0)`;
              return 60;
            } else {
              timerElem.current.style.background = `conic-gradient(#f4c030 ${
                100 - (newTimer / 60) * 100
              }%, #fafafa 0)`;
              return newTimer;
            }
          });
        }
      }, 500);
      return () => {
        clearInterval(timerInterval);
      };
    } else if (lookback) {
      getLogs();
    }
  }, [appName, resName, resource?.kind, autoRefresh, lookback]);

  const toggleAutoRefresh = useCallback((e: any) => {
    setAutoRefresh(e.target.checked);
  }, []);

  const updateLookback = useCallback((e: any) => {
    setLookback(e.target.value);
  }, []);

  return (
    <React.Fragment>
      <div className="application-details__tab-content-full-height application-log-summary ">
        <Tooltip
          content={
            <>
              Powered by
              <a href="https://numaproj.io/" target="_blank">
                Numaproj
              </a>
            </>
          }
        >
          <div className="ml-auto ls-absolute ls-right-[14px] ls-w-[50px] ls-h-auto">
            <NumaLogo />
          </div>
        </Tooltip>
        <div className="buttonContainer ls-flex ls-gap-0 !ls-mb-3">
          <Tooltip content="Click to toggle auto-reload timer">
            <label
              className={` ls-h-[36px] ls-pl-1 ls-transition-all ls-cursor-pointer ls-w-[36px] ls-flex ls-items-center ls-justify-center ls-rounded-full  ls-rounded-r-none  ls-uppercase ls-text-xs ls-relative ls-overflow-hidden ${
                autoRefresh
                  ? "ls-bg-warning hover:ls-bg-warning/60"
                  : "ls-bg-gray  hover:ls-bg-gray/80 ls-text-light"
              }`}
            >
              <div
                className="ls-block ls-rounded-full"
                style={{ border: "1px solid #fafafa" }}
              >
                <div
                  ref={timerElem}
                  className={`${
                    autoRefresh ? "ls-animate-pulse " : ""
                  } ls-transition-all ls-m-[1px] ls-duration-300 ls-box-content ls-h-[18px] ls-w-[18px] ls-rounded-full ls-border ls-border-[#f4c030]`}
                  style={{
                    background: `conic-gradient(#f4c030 100%, #fafafa 0)`,
                    transition: ".3s",
                  }}
                ></div>
              </div>
              <input
                type="checkbox"
                className="ls-hidden"
                checked={autoRefresh}
                onChange={toggleAutoRefresh}
              />
            </label>
          </Tooltip>
          <Tooltip content="Reload log summaries">
            <button
              onClick={getLogs}
              disabled={loading}
              className={`ls-flex ls-items-center ls-justify-center ls-transition-all ls-h-[36px] ls-px-3  ls-pl-2 ls-bg-warning hover:ls-bg-warning/60 ls-cursor-pointer ls-rounded-full ls-rounded-l-none ls-uppercase ls-relative ls-overflow-hidden`}
            >
              <div className="relative z-2 ls-pr-1">
                <i
                  className={`fa fa-rotate-right ls-text-dark ${
                    loading ? " ls-animate-spin " : ""
                  } `}
                />
              </div>
            </button>
          </Tooltip>
          <Tooltip content="Update log look-back duration">
            <select
              className="argo-field ls-mx-4 ls-w-[200px] ls-h-[2.5em] ls-text-dark/90"
              aria-expanded="false"
              defaultValue={3600}
              onChange={updateLookback}
              style={{ marginRight: "1em" }}
            >
              <option value={300}>5m ago</option>
              <option value={600}>10m ago</option>
              <option value={1800}>30m ago</option>
              <option value={3600}>1h ago</option>
              <option value={14400}>4h ago</option>
            </select>
          </Tooltip>
        </div>
        <div className="ls-w-full">
          <div ref={scrollRef}></div>
          <div ref={padRef}></div>

          <div
            className={`argo-table-list__row logs-list__log logs-list__log-- ls-mt-6 ls-mb-6`}
            ref={chartRef}
            style={{
              lineHeight: "1.6em",
              whiteSpace: "normal",
              padding: "1em .3em",
              zIndex: 1000,
            }}
          >
            <div className="ls-flex ls-gap-3 ls-w-full">
              <TimeSeriesChart
                chartData={anomalyMetricChartData}
                yFormatter={(y: any): number => y * 1}
                yUnit={""}
                events={events}
                domain={[0, 10]}
                ticks={[0, 2.5, 5.0, 7.5, 10]}
                valueRounding={2}
                labelKey={"Anomaly Score"}
              />
              <TimeSeriesChart
                chartData={errorRateMetricChartData}
                yFormatter={(y: any): number => y * 1}
                yUnit={"%"}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                events={events}
                valueRounding={2}
                labelKey={"Error Rate"}
              />
            </div>
          </div>
        </div>
        <div
          className="argo-table-list ls-overflow-auto ls-max-w-[100%]"
          style={{ paddingBottom: "2em" }}
        >
          <div className="argo-table-list__head">
            <div className="row">
              <div className="columns small-1">Time</div>
              <div className="columns small-5 ls-flex">
                <div style={levelLabelStyle}>Type</div>
                <div className="ls-pl-[1rem]" style={levelLogMsg}>
                  Log & Event Samples
                </div>
              </div>
              <div className="columns small-6">Summary</div>
            </div>
          </div>
          {logs?.map((log: LogData, i: number) => {
            return (
              <div
                className={`argo-table-list__row logs-list__log logs-list__log-- ls-fade-in-slide-up `}
                id={`${moment(log.timestamp * 1000)
                  .local()
                  .format("HH:mmA")}-container`}
                key={`log_${JSON.stringify(log)}`}
                style={{
                  lineHeight: "1.6em",
                  width: "100%",
                  whiteSpace: "normal",
                  padding: "1em .3em",
                }}
              >
                <div className="row ls-relative">
                  <div
                    className="ls-absolute ls-top-[-230px]"
                    id={moment(log.timestamp * 1000)
                      .local()
                      .format("HH:mmA")}
                  ></div>
                  <div className="columns small-1 xxlarge-1 !ls-overflow-auto !ls-whitespace-break-spaces ls-font-medium">
                    <div>
                      {moment(log.timestamp * 1000)
                        .local()
                        .format("HH:mm A")}
                    </div>
                  </div>

                  <div className="columns small-5 xxlarge-5">
                    <div style={levelRows}>
                      <div
                        style={levelLabelStyle}
                        className=" ls-flex ls-items-start ls-gap-2"
                      >
                        <div className=" ls-relative ls-w-[12px] ls-h-[12px] ls-top-[1px] ls-mt-[2px]">
                          <EventIcon className=" ls-absolute ls-left-[-1px] ls-top-[-5px] ls-w-[16px]" />
                        </div>
                        <span className=" ls-text-xs ls-font-medium ls-mt-[2.5px]">
                          K8s Events
                        </span>
                      </div>
                      <div style={levelLogMsg}>
                        {(log?.event_sample?.trim() != "N/A" &&
                          log?.event_sample?.trim()) ||
                          "No k8s error events"}
                      </div>
                    </div>

                    <div style={levelRows}>
                      <div
                        style={levelLabelStyle}
                        className=" ls-flex ls-items-start ls-gap-2"
                      >
                        <div className=" ls-relative ls-mt-[2.5px] ls-h-[12px] !ls-min-w-[12px] ls-overflow-hidden ls-rounded-full ls-bg-dark !ls-border-[2px] !ls-border-dark/20 "></div>
                        <div className=" ls-text-xs ls-font-medium ls-min-w-[65px] ls-mt-[2.5px]">
                          Fatal Logs
                        </div>
                        <div className=" ls-text-xs ls-font-medium ls-mt-[2.5px]">
                          {log.overall_numbers.fatal}
                        </div>
                      </div>
                      <div style={levelLogMsg}>
                        <LogClusterMessasges
                          label="fatal"
                          logCluster={log?.log_clusters}
                        />
                      </div>
                    </div>
                    <div style={levelRows}>
                      <div
                        style={levelLabelStyle}
                        className=" ls-flex ls-items-start ls-gap-2"
                      >
                        <div className=" ls-relative ls-mt-[2.5px] ls-h-[12px] !ls-min-w-[12px] ls-overflow-hidden ls-rounded-full ls-bg-danger !ls-border-[2px] !ls-border-dark/20 "></div>
                        <div className=" ls-text-xs ls-font-medium ls-min-w-[65px] ls-mt-[2.5px]">
                          Error Logs
                        </div>
                        <div className=" ls-text-xs ls-font-medium ls-mt-[2.5px]">
                          {log.overall_numbers.error}
                        </div>
                      </div>
                      <div style={levelLogMsg}>
                        <LogClusterMessasges
                          label="error"
                          logCluster={log?.log_clusters}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="columns small-6 xxlarge-6"
                    style={{
                      whiteSpace: "normal",
                    }}
                  >
                    <div className=" ls-mb-4 ls-whitespace-pre-wrap">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: log?.brief_summary
                            ?.replace(/\s+/g, " ")
                            ?.trim()
                            ?.replace('"Summary"', "<strong>Summary</strong>")
                            ?.replace(
                              '"Potential Root Cause"',
                              "Potential Root Cause"
                            )
                            ?.replace(
                              "Potential Root Cause",
                              "\n\n<strong>Potential Root Cause</strong>"
                            )
                            .replace(/["']/g, ""),
                        }}
                      ></div>
                    </div>
                    <div>
                      <div className=" ls-inline-block ls-bg-parkBlue/10 ls-rounded-lg !ls-py-1 !ls-px-3 ls-font-semibold !ls-text-xs ls-uppercase">
                        {log?.model_type?.trimStart()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

export const component = Extension;
((window: any) => {
  window?.extensionsAPI?.registerResourceExtension(
    component,
    "**",
    "Rollout",
    "Numaproj Assist",
    { icon: "fa fa-robot" }
  );
})(window);

((window: any) => {
  window?.extensionsAPI?.registerResourceExtension(
    component,
    "**",
    "Pod",
    "Numaproj Assist",
    { icon: "fa fa-robot" }
  );
})(window);
