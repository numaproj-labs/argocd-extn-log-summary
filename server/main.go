package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/numaproj-labs/argocd-extn-log-summary/server/pkg"
	"github.com/penglongli/gin-metrics/ginmetrics"
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

	handler := NewLogHandler(client)

	r.GET("/data/:namespace/:type/:name/:start/:end", func(c *gin.Context) {
		handler.handle(c)
	})

	go func() {
		err := metrics.Run(":8490")
		if err != nil {
			panic(err)
		}
	}()
	err = http.ListenAndServe(":8080", r)
	panic(err)
}
