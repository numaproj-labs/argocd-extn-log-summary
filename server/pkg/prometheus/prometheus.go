package prometheus

import (
	"context"
	"fmt"
	prometheusapi "github.com/prometheus/client_golang/api"
	prometheusV1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
	"strconv"
	"time"
)

type PrometheusClient struct {
	Client prometheusV1.API
}

func createPrometheusAPI(address string) (prometheusV1.API, error) {

	prometheusApiConfig := prometheusapi.Config{
		Address: address,
	}
	client, err := prometheusapi.NewClient(prometheusApiConfig)
	if err != nil {
		return nil, err
	}
	return prometheusV1.NewAPI(client), nil
}

func NewPrometheusClient(url string) (*PrometheusClient, error) {
	client, err := createPrometheusAPI(url)
	if err != nil {
		return nil, err
	}
	return &PrometheusClient{
		Client: client,
	}, nil
}

func (pc PrometheusClient) Query(ctx context.Context, query string, start, end string) (model.Value, error) {
	startTime, err := strconv.ParseInt(start, 10, 64)
	if err != nil {
		return nil, err
	}
	endTime, err := strconv.ParseInt(end, 10, 64)
	if err != nil {
		return nil, err
	}
	fmt.Printf("Query: %s  Start:%v  End: %v \n", query, time.Unix(startTime, 0), time.Unix(endTime, 0))
	result, w, err := pc.Client.QueryRange(ctx, query, prometheusV1.Range{Start: time.Unix(startTime, 0), End: time.Unix(endTime, 0), Step: time.Minute})
	fmt.Println(err, w, result)
	if result == nil {
		return nil, nil
	}
	return result, err
}
