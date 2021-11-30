const db = require("../model/db");
exports.makeNotification = (notification, callback) => {
    try {
      db.start.query(
        "INSERT INTO notification SET ?",
        [
          {
            type: notification.type,
            title: notification.title,
            description: notification.description,
            notification_to: notification.notification_to,
            notification_from: notification.notification_from,
            link: notification.link,
          },
        ],
        (error, results) => {
          if (!error) {
            return callback(null, "success");
          } else {
            return callback(error, null);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  };