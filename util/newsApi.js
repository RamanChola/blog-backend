var axios = require("axios").default;
const NewsApi = (req, res) => {
  var options = {
    method: "GET",
    url: "https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/search/TrendingNewsAPI",
    params: {
      pageNumber: "1",
      pageSize: "10",
      withThumbnails: "false",
      location: "us",
    },
    headers: {
      "x-rapidapi-key": process.env.XRAPID_KEY,
      "x-rapidapi-host": "contextualwebsearch-websearch-v1.p.rapidapi.com",
    },
  };

  axios
    .request(options)
    .then(function (response) {
      res.status(200).json(response.data.value);
    })
    .catch(function (error) {
      console.error(error);
    });
};

module.exports = NewsApi;
