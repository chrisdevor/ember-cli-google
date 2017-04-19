import Ember from 'ember';

export default Ember.Component.extend({
  /// The Google reCAPTCHA service.
  grecaptcha: Ember.inject.service ('g-recaptcha'),

  /// Set the required class names for the reCAPTCHA element.
  classNames: ['g-recaptcha'],

  actions: {
    /**
     * Reset the widget. After the widget has been reset, it will not have
     * a response.
     */
    reset () {
      // Clear the current response.
      this.set ('response');
    }
  },

  hasResponse: Ember.computed ('response', function () {
    const response = this.get ('response');
    return !Ember.isEmpty (response);
  }),

  /**
   * The name of your callback function to be executed when the user submits
   * a successful CAPTCHA response. The user's response, g-recaptcha-response,
   * will be the input for your callback function.
   *
   * @private
   */
  _callback () {
    let grecaptcha = this.get ('grecaptcha');
    const widgetId = this.get ('widgetId');

    grecaptcha
      .getResponse (widgetId)
      .then (function (response) {
        // Store the response for the reCAPTCHA widget. This will allow us to
        // access it at a later time.
        this.set ('response', response);

        // Let the client (or parent) know that we have received a response. We,
        // however, are not going to tell them the response value since that is not
        // really important to them.
        let onResponse = this.get ('onResponse');

        if (onResponse) {
          onResponse ();
        }
      }.bind (this));
  },

  /**
   * Callback function to be executed when the recaptcha response expires and the
   * user needs to solve a new CAPTCHA.
   *
   * @private
   */
  _expiredCallback () {
    let onExpired = this.get ('onExpired');

    if (onExpired) {
      onExpired ();
    }
  }
});
