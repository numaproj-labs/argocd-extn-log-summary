package pkg

import (
	"context"
	"github.com/caitlinelfring/go-env-default"
	"github.com/numaproj-labs/argocd-extn-log-summary/server/pkg/common"
	"github.com/numaproj-labs/argocd-extn-log-summary/server/pkg/redis"
)

type LogSummarizationClient interface {
	GetSummarization(ctx context.Context, namespace, objType, name, start, end string, anomaly, errorRate map[string]string) ([]map[string]interface{}, error)
}

func NewLogClient() (LogSummarizationClient, error) {
	switch env.GetDefault(common.CLIENT_TYPE, "redis") {
	case "redis":
		return redis.NewRedisDB()
	default:
		return redis.NewRedisDB()
	}
}
