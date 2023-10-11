package main

import (
	"github.com/gin-gonic/gin"
	"github.com/numaproj-labs/argocd-extn-log-summary/server/pkg"
	"net/http"
)

type Handler struct {
	logClinet pkg.LogSummarizationClient
}

func NewLogHandler(client pkg.LogSummarizationClient) *Handler {
	handler := Handler{}
	handler.logClinet = client
	return &handler
}

func (lh Handler) handle(c *gin.Context) {
	objNamespace := c.Param("namespace")
	objType := c.Param("type")
	objName := c.Param("name")
	rangeStart := c.Param("start")
	rangeEnd := c.Param("end")
	result, err := lh.logClinet.GetSummarization(c, objNamespace, objType, objName, rangeStart, rangeEnd)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}
	c.JSON(http.StatusOK, result)
}
