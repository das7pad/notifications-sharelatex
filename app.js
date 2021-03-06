/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const metrics = require('@overleaf/metrics')
metrics.initialize('notifications')
const Settings = require('settings-sharelatex')
const logger = require('logger-sharelatex')
logger.initialize('notifications')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const controller = require('./app/js/NotificationsController')

metrics.memory.monitor(logger)

const HealthCheckController = require('./app/js/HealthCheckController')

app.use(bodyParser())
app.use(metrics.http.monitor(logger))

metrics.injectMetricsRoute(app)

app.post('/user/:user_id', controller.addNotification)
app.get('/user/:user_id', controller.getUserNotifications)
app.delete(
  '/user/:user_id/notification/:notification_id',
  controller.removeNotificationId
)
app.delete('/user/:user_id', controller.removeNotificationKey)
app.delete('/key/:key', controller.removeNotificationByKeyOnly)

app.get('/status', (req, res) => res.send('notifications sharelatex up'))

app.get('/health_check', (req, res) =>
  HealthCheckController.check(function (err) {
    if (err != null) {
      logger.err({ err }, 'error performing health check')
      return res.sendStatus(500)
    } else {
      return res.sendStatus(200)
    }
  })
)

app.get('*', (req, res) => res.sendStatus(404))

const host =
  __guard__(
    Settings.internal != null ? Settings.internal.notifications : undefined,
    (x) => x.host
  ) || 'localhost'
const port =
  __guard__(
    Settings.internal != null ? Settings.internal.notifications : undefined,
    (x1) => x1.port
  ) || 3042
app.listen(port, host, () =>
  logger.info(`notifications starting up, listening on ${host}:${port}`)
)

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined
}
