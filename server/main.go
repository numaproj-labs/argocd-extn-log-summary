package main

import (
	"fmt"
	"github.com/caitlinelfring/go-env-default"
	"github.com/gin-gonic/gin"
	"github.com/numaproj-labs/logsummerservice/pkg"
	"github.com/numaproj-labs/logsummerservice/pkg/common"
	"github.com/numaproj-labs/logsummerservice/pkg/prometheus"
	"github.com/penglongli/gin-metrics/ginmetrics"
	"log"
	"net/http"
)

func main() {
	r := gin.Default()
	metrics := gin.Default()
	m := ginmetrics.GetMonitor()
	// +optional set metric path, default /debug/metrics
	m.SetMetricPath("/metrics")
	m.UseWithoutExposingEndpoint(r)
	// +optional set slow time, default 5s
	m.SetSlowTime(10)
	// +optional set request duration, default {0.1, 0.3, 1.2, 5, 10}
	// used to p95, p99
	m.SetDuration([]float64{0.1, 0.3, 1.2, 5, 10})
	m.Expose(metrics)
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	client, err := pkg.NewLogClient()
	if err != nil {
		log.Fatal(err)
	}
	prometheusURL := env.GetDefault(common.PROMETEUS_URL, "http://prometheus.addon-metricset-ns.svc.cluster.local:9090")
	metricsClient, err := prometheus.NewPrometheusClient(prometheusURL)
	if err != nil {
		log.Fatal(err)
	}
	handler := NewLogHandler(client, metricsClient)

	r.GET("/data/:namespace/:type/:name/:start/:end", func(c *gin.Context) {
		handler.handle(c)
	})
	r.GET("/metrics/:metricsname/:namespace/:application/:start/:end", func(c *gin.Context) {
		handler.queryMetrics(c)
	})

	go func() {
		metrics.Run(":8490")
	}()
	err = http.ListenAndServe(":8080", r)
	fmt.Println("test", err)
}
