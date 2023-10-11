package pkg

import (
	"gopkg.in/yaml.v3"
	"log"
	"os"
)

type Config struct {
	Data map[string]interface{}
}

func NewConfig(path string) *Config {
	conf := Config{}
	f, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}
	conf.Data = make(map[string]interface{})
	err = yaml.Unmarshal(f, conf.Data)
	if err != nil {
		log.Fatal(err)
	}
	return &conf
}
