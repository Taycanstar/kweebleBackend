const router = require("express").Router();
const User = require("../models/User");

router.get("/", (req, res) => {
  User.find({})
    .then((data) => {
      console.log("Data: ", data);
      res.json(data);
    })
    .catch((error) => {
      console.log("error: ", error);
    });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      // Subscribe the devices corresponding to the registration tokens to the
      // topic.
      if (user.scopes) {
        user.scopes.forEach((scope) => {
          getMessaging()
            .subscribeToTopic(user.registrationTokens, scope._id)
            .then((response) => {
              // See the MessagingTopicManagementResponse reference documentation
              // for the contents of response.
              console.log("Successfully subscribed to topic:", response);
            })
            .catch((error) => {
              console.log("Error subscribing to topic:", error);
            });
        });
      }

      res.json(data);
    })
    .catch((error) => {
      console.log("error: ", error);
    });
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  User.findByIdAndUpdate(id, { username: req.body.username }, { new: true })
    .then((data) => {
      console.log("Data: ", data);
      res.json(data);
    })
    .catch((error) => {
      console.log("error: ", error);
      res.json(error);
    });
});

module.exports = router;
