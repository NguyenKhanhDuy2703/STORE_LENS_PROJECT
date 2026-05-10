const axios = require('axios');
const logger = require('../utils/logging');
const CameraSchema = require('../schemas/camera.schema');
const config = require('../config');

const { port: AI_PORT } = config.getConfig().apiAI;
const AI_BASE_URL = `http://localhost:${AI_PORT}`;

const cameraHealthWorker = {
  async checkAllActiveCameras() {
    try {
      const activeCameras = await CameraSchema.find({ status: 'active' }).select(
        'camera_code rtsp_url status'
      );

      if (activeCameras.length === 0) {
        return; 
      }

      logger.info(`[cameraHealth] Checking ${activeCameras.length} active camera(s)`);

      for (const camera of activeCameras) {
        try {
          const isRunning = await this.checkProcessStatus(camera.rtsp_url);

          if (!isRunning) {
            logger.warn(
              `[cameraHealth] Camera ${camera.camera_code} process is not running. Updating status to inactive.`
            );

            await CameraSchema.findOneAndUpdate(
              { camera_code: camera.camera_code },
              {
                $set: {
                  status: 'inactive',
                  'camera_state.last_stop_time': new Date(),
                },
              }
            );
          }
        } catch (err) {
          logger.error(
            `[cameraHealth] Error checking camera ${camera.camera_code}: ${err.message}`
          );
        }
      }
    } catch (err) {
      logger.error(`[cameraHealth] Fatal error: ${err.message}`);
    }
  },
  async checkProcessStatus(rtspUrl) {
    try {
      const response = await axios.get(
        `${AI_BASE_URL}/api/v1/tracking/status`,
        {
          params: { url_rtsp: rtspUrl },
          timeout: 5000,
        }
      );

      const data = response.data || {};
      return data.is_running === true;
    } catch (err) {
      logger.warn(
        `[cameraHealth] Failed to query MODULE_AI: ${err.message}. Assuming process not running.`
      );
      return false; 
    }
  },
};

module.exports = cameraHealthWorker;
