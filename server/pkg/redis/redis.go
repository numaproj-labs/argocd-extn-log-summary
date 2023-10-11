package redis

import (
	"context"
	"fmt"
	"github.com/numaproj-labs/argocd-extn-log-summary/server/pkg/common"
	"strconv"
	"strings"

	"github.com/caitlinelfring/go-env-default"
	redis "github.com/redis/go-redis/v9"
)

type redisDB struct {
	client redis.UniversalClient
}

func NewRedisDB() (*redisDB, error) {
	redisHost := env.GetDefault(common.REDIS_HOST, "localhost")
	if redisHost == "" {
		return nil, fmt.Errorf("redis Host not found")
	}
	redisMaster := env.GetDefault(common.REDIS_MASTERNAME, "mymaster")
	redisUser := env.GetDefault(common.REDIS_USER, "default")
	redisPassword := env.GetDefault(common.REDIS_PASSWORD, "")
	redisURLs := strings.Split(redisHost, ",")
	rdb := redisDB{}
	if redisMaster != "" {
		opts := redis.UniversalOptions{
			Addrs:            redisURLs,
			MasterName:       redisMaster,
			SentinelPassword: redisPassword,
			SentinelUsername: redisUser,
			Username:         redisUser,
			Password:         redisPassword,
		}
		fmt.Println(opts)
		rdb.client = redis.NewUniversalClient(&opts)

	} else {
		rdb.client = redis.NewUniversalClient(&redis.UniversalOptions{
			Addrs:    redisURLs,
			Password: redisPassword,
			Username: redisUser,
		})
	}
	return &rdb, nil
}

func (rdb *redisDB) GetSummarization(ctx context.Context, namespace, objType, name, start, end string) ([]string, error) {
	key := fmt.Sprintf("%s:%s:%s", namespace, objType, name)
	for {
		var cursor uint64
		var n int
		var keys []string
		var err error
		keys, cursor, err = rdb.client.Scan(ctx, cursor, "*", 10).Result()
		if err != nil {
			panic(err)
		}
		n += len(keys)

		for _, keyval := range keys {
			fmt.Println(keyval)
		}

		if cursor == 0 {
			break
		}
	}
	startInt, err := strconv.Atoi(start)
	if err != nil {
		return nil, err
	}
	endInt, err := strconv.Atoi(end)
	if err != nil {
		return nil, err
	}

	fmt.Println(startInt, endInt)
	result := rdb.client.ZRangeByScore(ctx, key, &redis.ZRangeBy{Min: start, Max: end})
	return result.Result()
}
