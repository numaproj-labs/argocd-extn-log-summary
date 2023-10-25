package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/numaproj-labs/logsummerservice/pkg/common"
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

func (rdb *redisDB) GetSummarization(ctx context.Context, namespace, objType, name, start, end string) ([]map[string]interface{}, error) {
	key := fmt.Sprintf("%s:%s:%s", namespace, objType, name)
	startInt, err := strconv.Atoi(start)
	if err != nil {
		return nil, err
	}
	endInt, err := strconv.Atoi(end)
	if err != nil {
		return nil, err
	}

	fmt.Println(startInt, endInt)
	quaryOutput := rdb.client.ZRevRangeByScoreWithScores(ctx, key, &redis.ZRangeBy{Min: start, Max: end})
	results, err := quaryOutput.Result()
	if err != nil {
		fmt.Println("Error:", err)
		return nil, err
	}
	var summaryResults []map[string]interface{}
	for _, result := range results {
		summary := fmt.Sprintf("%v", result.Member)
		fmt.Println(summary)
		//unquoteResult, err := strconv.Unquote(summary)
		//if err != nil {
		//	fmt.Println("Summary Parsing Error:", err)
		//	continue
		//}
		//fmt.Println(unquoteResult)
		var summaryMap map[string]interface{}
		err = json.Unmarshal([]byte(summary), &summaryMap)
		if err != nil {
			fmt.Println("Summary Parsing Error:", err)
			continue
		}
		summaryMap["timestamp"] = result.Score
		fmt.Println(summary)
		summaryResults = append(summaryResults, summaryMap)
	}
	return summaryResults, err
}
