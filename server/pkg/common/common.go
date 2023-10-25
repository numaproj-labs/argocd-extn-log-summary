package common

const CLIENT_TYPE = "CLIENT_TYPE"

const REDIS_HOST = "REDIS_HOST"
const REDIS_PORT = "REDIS_PORT"
const REDIS_MASTERNAME = "REDIS_MASTERNAME"
const REDIS_USER = "REDIS_USER"
const REDIS_PASSWORD = "REDIS_PASSWORD"
const REDIS_DB_NO = "REDIS_DB_NO"
const PROMETEUS_URL = "PROMETHEUS_URL"

//type Summary struct {
//	OverallNumbers struct {
//		Info  int `json:"info"`
//		Error int `json:"error"`
//		Warn  int `json:"warn"`
//		Fatal int `json:"fatal"`
//	} `json:"overall_numbers"`
//	TypicalLogs struct {
//		Info  time.Time `json:"info"`
//		Error string    `json:"error"`
//		Warn  string    `json:"warn"`
//		Fatal string    `json:"fatal"`
//	} `json:"typical_logs"`
//	LogClusters []struct {
//		Log       time.Time `json:"log"`
//		Type      string    `json:"type"`
//		LogsCount int       `json:"logs_count"`
//	} `json:"log_clusters"`
//	ModelType    string    `json:"model_type"`
//	BriefSummary string    `json:"brief_summary"`
//	EventSample  time.Time `json:"event_sample"`
//}

type SummaryPayload struct {
	Timestamp      float64 `json:"timestamp"`
	OverallNumbers struct {
		Info  int `json:"info"`
		Error int `json:"error"`
		Warn  int `json:"warn"`
		Fatal int `json:"fatal"`
	} `json:"overall_numbers"`
	TypicalLogs struct {
		Info  string `json:"info"`
		Error string `json:"error"`
		Warn  string `json:"warn"`
		Fatal string `json:"fatal"`
	} `json:"typical_logs"`
	LogClusters []struct {
		Log       string `json:"log"`
		Type      string `json:"type"`
		LogsCount int    `json:"logs_count"`
	} `json:"log_clusters"`
	ModelType    string `json:"model_type"`
	BriefSummary string `json:"brief_summary"`
	EventSample  string `json:"event_sample"`
}

func (sp *SummaryPayload) UpdateTimestamp(ts float64) {
	sp.Timestamp = ts
}

//func main() {
//	jsonStr := `{"overall_numbers":{"info":719,"error":1,"warn":0,"fatal":0},"typical_logs":{"info":"time=\"2023-10-12T20:10:39Z\" level=info msg=\"msg=Request served successfully\" status=200\nLog type: info, log count: 369, log sample: ","error":"time=\"2023-10-12T20:10:25Z\" level=error msg=\"msg=connection timeout error: failed to retry entry: redis connection context deadline exceeded\" status=500\nLog type: info, log count: 350, log sample: ","warn":"N/A","fatal":"N/A"},"log_clusters":[{"log":"time=\"2023-10-12T20:10:25Z\" level=error msg=\"msg=connection timeout error: failed to retry entry: redis connection context deadline exceeded\" status=500","type":"error","logs_count":1},{"log":"time=\"2023-10-12T20:10:39Z\" level=info msg=\"msg=Request served successfully\" status=200","type":"info","logs_count":350},{"log":"time=\"2023-10-12T20:10:38Z\" level=info msg=\"msg=User successfully logged\" status=200","type":"info","logs_count":369}],"model_type":"genai","brief_summary":"\n            \"Summary\" (about errors): There is one error log indicating that there was a connection timeout error.\n            \n            \"Potential Root Cause\" (if there are any kind of errors): The connection timeout error may have been caused by an underlying issue with the pod or network connection.","event_sample":""}`
//	logObj := SummaryPayload{}
//	err := json.Unmarshal([]byte(jsonStr), &logObj)
//	fmt.Println(err)
//	logObj.Timestamp = 22222
//	test, err := json.Marshal(logObj)
//	fmt.Println(string(test))
//
//}
