package pkg

import (
	"context"
	"github.com/caitlinelfring/go-env-default"
	"github.com/numaproj-labs/logsummerservice/pkg/common"
	"github.com/numaproj-labs/logsummerservice/pkg/redis"
)

type LogSummarizationClient interface {
	GetSummarization(ctx context.Context, namespace, objType, name, start, end string) ([]map[string]interface{}, error)
}

func NewLogClient() (LogSummarizationClient, error) {
	switch env.GetDefault(common.CLIENT_TYPE, "redis") {
	case "redis":
		return redis.NewRedisDB()
	default:
		return redis.NewRedisDB()
	}
}
