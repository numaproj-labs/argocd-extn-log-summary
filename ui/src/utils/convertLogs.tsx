const convertLogs = (logStr: string) => {

  const messageSummaryPattern =
    /Info count: (\d+), Error count: (\d+), Warn count: (\d+), Fatal count: (\d+)/;
  const messagePattern =
    /(Info|Error): time="(.*?)" level=(.*?) msg="(.*?)" status=(\d+)/g;
  const summaryOverviewPattern =
    /The log sample contains (\d+) info messages, (\d+) error messages, (\d+) warn messages, and (\d+) fatal messages./;

  const messageSummaryMatches = logStr.match(messageSummaryPattern);
  const summaryOverviewMatches = logStr.match(summaryOverviewPattern);

  const jsonObject: any = {
    messageSummary: {
      infoCount: messageSummaryMatches[1],
      errorCount: messageSummaryMatches[2],
      warnCount: messageSummaryMatches[3],
      fatalCount: messageSummaryMatches[4],
    },
    messages: [],
    summaryOverview: {
      infoCount: summaryOverviewMatches[1],
      errorCount: summaryOverviewMatches[2],
      warnCount: summaryOverviewMatches[3],
      fatalCount: summaryOverviewMatches[4],
    },
  };

  let messageMatch;
  while ((messageMatch = messagePattern.exec(logStr)) !== null) {
    jsonObject.messages.push({
      type: messageMatch[1],
      time: messageMatch[2],
      level: messageMatch[3],
      msg: messageMatch[4],
      status: messageMatch[5],
    });
  }

  return jsonObject;
};
