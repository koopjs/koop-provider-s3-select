/**
 * Model constructor
 */
function Model () {}

/**
 * Fetch data from source.  Pass result or error to callback.
 * This is the only public function you need to implement on Model
 * @param {object} express request object
 * @param {function} callback
 */
Model.prototype.getData = function (req, callback) {
  // stub
  callback(null, {})
}

module.exports = Model
