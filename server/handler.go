package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/numaproj-labs/argocd-extn-log-summary/server/pkg"
	"github.com/numaproj-labs/argocd-extn-log-summary/server/pkg/prometheus"
	"net/http"
)

type Handler struct {
	logClinet     pkg.LogSummarizationClient
	metricsClient *prometheus.PrometheusClient
}

func NewLogHandler(client pkg.LogSummarizationClient, metricsClient *prometheus.PrometheusClient) *Handler {
	handler := Handler{}
	handler.logClinet = client
	handler.metricsClient = metricsClient
	return &handler
}
func (lh Handler) queryMetrics(c *gin.Context) {
	namespace := c.Param("namespace")
	//app := c.Param("application")
	rangeStart := c.Param("start")
	rangeEnd := c.Param("end")
	metricsName := c.Param("metricsname")

	query := fmt.Sprintf("max_over_time(%s {namespace='%s'}[1m])", metricsName, namespace)
	metricsResult, err := lh.metricsClient.Query(c, query, rangeStart, rangeEnd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, metricsResult)
}

func (lh Handler) handle(c *gin.Context) {
	objNamespace := c.Param("namespace")
	objType := c.Param("type")
	objName := c.Param("name")
	rangeStart := c.Param("start")
	rangeEnd := c.Param("end")
	//query := fmt.Sprintf("max_over_time(namespace_app_rollouts_unified_anomaly[1m])")
	//anomalyResult, err := lh.metricsClient.Query(c, query, rangeStart, rangeEnd)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, err)
	//}
	//query = fmt.Sprintf("max_over_time(namespace_app_rollouts_http_request_error_rate[1m])")
	//errorRateResult, err := lh.metricsClient.Query(c, query, rangeStart, rangeEnd)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, err)
	//}
	anomalyMap := make(map[string]string)
	errorRateMapMap := make(map[string]string)
	//if anomalyResult != nil {
	//	anomalyMap = lh.metricsClient.ConvertMetricMap(anomalyResult.String())
	//}
	//if errorRateResult != nil {
	//	errorRateMapMap = lh.metricsClient.ConvertMetricMap(errorRateResult.String())
	//}
	result, err := lh.logClinet.GetSummarization(c, objNamespace, objType, objName, rangeStart, rangeEnd, anomalyMap, errorRateMapMap)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, result)
}

//type logStats struct {
//}
//
//type logSummary struct {
//	ts string
//	stats
//}
//
//func parseJSON(payload string) {
//
//	json
//}
