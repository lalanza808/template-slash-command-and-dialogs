require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ticket = require('./ticket');
const signature = require('./verifySignature');
const api = require('./api');
const payloads = require('./payloads');
const debug = require('debug')('slash-command-template:index');
const slugify = require('slugify');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
    ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

/*
 * Endpoint to receive /helpdesk slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/command', async (req, res) => {
  // Verify the signing secret
  if (!signature.isVerified(req)) {
    debug('Verification token mismatch');
    return res.status(404).send();
  }

  // extract the slash command text, and trigger ID from payload
  const { trigger_id } = req.body;

  // create the modal payload - includes the dialog structure, Slack API token,
  // and trigger ID
  let view = payloads.select_action_modal({
    trigger_id
  });

  let result = await api.callSlackAPI('views.open', view);

  debug('views.open: %o', result);
  return res.send('');
});

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a Helpdesk ticket
 */
app.post('/interactive', async (req, res) => {
  // Verify the signing secret
  if (!signature.isVerified(req)) {
    debug('Verification token mismatch');
    return res.status(404).send();
  }

  const body = JSON.parse(req.body.payload);

  // Handle modal interface views to user Slack
  if ( body.actions ) {
    const { action_id } = body.actions[0];
    const { trigger_id } = body;

    if ( action_id == 'create_new_channel_modal' ) {
      console.log('[+] Loading new channel modal for @' + body.user.username);
      var view = payloads.new_channel_modal({
        trigger_id,
        initiating_user: body.user.id
      });
    } else if ( action_id == 'generate_documents_modal' ) {
      console.log('[+] Loading generate new documents modal for @' + body.user.username);
      var view = payloads.generate_docs_modal({
        trigger_id
      });
    }

    let result = await api.callSlackAPI('views.push', view);
    debug('views.push: %o', result);
    return res.send('');
  }

  // Handle actions based upon user selection and inputs
  if ( body.view.callback_id == 'submit_new_channel' ) {
    console.log('[+] Creating new channel for @' + body.user.username);

    // Gather vars and setup slug from customer name
    let cx_name = body.view.state.values.customer_name.customer_name.value;
    let cx_char = cx_name.charAt(0);
    let cx_slug = slugify(cx_name, {
      strict: true,
      lower: true
    });

    // Check if first character is a number so it can go into numeric group
    if ( !isNaN(cx_char) ) {
      var gdrive_prefix = '0-9';
    } else {
      var gdrive_prefix = cx_char.toUpperCase();
    }

    // Create users array to add to channel
    const users = body.view.state.values.users_to_add.users_to_add.selected_users.map(async function(item) {
      var result = await api.callSlackAPI('users.info', {
        user: item
      });
      let slack_username = '@' + result.user.name;
      return slack_username
    });

    await Promise.all(users).then(async function(result) {
      // Post to Zapier to run Zap to create new channel
      await api.postZapierWebhook(process.env.ZAPIER_WEBHOOK_submit_new_channel, {
        'customer_name': cx_name,
        'gdrive_prefix': gdrive_prefix,
        'slack_channel': cx_slug,
        'users': result
      });
    })
  } else if ( body.view.callback_id == 'generate_documents' ) {
    console.log('[+] Generating documents for @' + body.user.username);

    // Gather vars and setup slug from customer name
    let cx_name = body.view.state.values.customer_name.customer_name.value;
    let opp_name = body.view.state.values.opportunity_name.opportunity_name.value;
    let cx_char = cx_name.charAt(0);

    // Check if first character is a number so it can go into numeric group
    if ( !isNaN(cx_char) ) {
      var gdrive_prefix = '0-9';
    } else {
      var gdrive_prefix = cx_char.toUpperCase();
    }

    // Post to Zapier to run Zap to generate new docs in the channel
    await api.postZapierWebhook(process.env.ZAPIER_WEBHOOK_generate_documents, {
      'customer_name': cx_name,
      'gdrive_prefix': gdrive_prefix,
      'gdrive_item': cx_name + ' - ' + opp_name,
      'slack_channel': body.view.state.values.channel_to_post_to.channel_to_post_to.selected_channels[0],
    });
  }

  return res.send('')
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
