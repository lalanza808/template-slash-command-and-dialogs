module.exports = {
    select_action_modal: context => {
        return {
            trigger_id: context.trigger_id,
            view: JSON.stringify({
                type: 'modal',
                title: {
                    type: 'plain_text',
                    text: 'What do you want to do?'
                },
                callback_id: 'select-action',
                submit: {
                    type: 'plain_text',
                    text: 'Submit'
                },
                blocks: [
                  {
                    'type': 'section',
                    'text': {
                      'type': 'mrkdwn',
                      'text': 'Create new Slack channel for opportunity.'
                    },
                    'accessory': {
                      'type': 'button',
                      'text': {
                        'type': 'plain_text',
                        'text': 'Go',
                        'emoji': true
                      },
                      'action_id': 'create_new_channel_modal'
                    }
                  },
                  {
                    'type': 'section',
                    'text': {
                      'type': 'mrkdwn',
                      'text': 'Generate new documents for opportunity.'
                    },
                    'accessory': {
                      'type': 'button',
                      'text': {
                        'type': 'plain_text',
                        'text': 'Go',
                        'emoji': true
                      },
                      'action_id': 'generate_documents_modal'
                    }
                  }
                ]
            })
        }
    },
    new_channel_modal: context => {
        return {
            trigger_id: context.trigger_id,
            view: JSON.stringify({
                type: 'modal',
                title: {
                    type: 'plain_text',
                    text: 'Create new channel'
                },
                callback_id: 'submit_new_channel',
                submit: {
                    type: 'plain_text',
                    text: 'Submit'
                },
                blocks: [
                    {
                        block_id: 'customer_name',
                        type: 'input',
                        label: {
                            type: 'plain_text',
                            text: 'Customer Name'
                        },
                        element: {
                            action_id: 'customer_name',
                            type: 'plain_text_input'
                        },
                        hint: {
                            type: 'plain_text',
                            text: 'Please use full spelling of the company'
                        }
                    },
                    {
                        block_id: 'users_to_add',
                        type: 'input',
                        label: {
                            type: 'plain_text',
                            text: 'Select Users to Add'
                        },
                        element: {
                            action_id: 'users_to_add',
                            type: 'multi_users_select',
                            initial_users: [context.initiating_user]
                        },
                        hint: {
                            type: 'plain_text',
                            text: 'Include others who will need to be present'
                        }
                    }
                ]
            })
        }
    },
    generate_docs_modal: context => {
        return {
            trigger_id: context.trigger_id,
            view: JSON.stringify({
                type: 'modal',
                title: {
                    type: 'plain_text',
                    text: 'Generate Documents'
                },
                callback_id: 'generate_documents',
                submit: {
                    type: 'plain_text',
                    text: 'Submit'
                },
                blocks: [
                    {
                        block_id: 'customer_name',
                        type: 'input',
                        label: {
                            type: 'plain_text',
                            text: 'Customer Name'
                        },
                        element: {
                            action_id: 'customer_name',
                            type: 'plain_text_input'
                        },
                        hint: {
                            type: 'plain_text',
                            text: 'Name of the customer ie. ACME Corp, Fancy Corp LLC, Such and Such Enterprises, etc'
                        }
                    },
                    {
                        block_id: 'opportunity_name',
                        type: 'input',
                        label: {
                            type: 'plain_text',
                            text: 'Opportunity Name'
                        },
                        element: {
                            action_id: 'opportunity_name',
                            type: 'plain_text_input'
                        },
                        hint: {
                            type: 'plain_text',
                            text: 'Name of the opportunity, ie. MD40, PS k8s advisory/consulting, CloudOne, etc'
                        }
                    },
                    {
                        block_id: 'channel_to_post_to',
                        type: 'input',
                        label: {
                            type: 'plain_text',
                            text: 'Select channel to notify'
                        },
                        element: {
                            action_id: 'channel_to_post_to',
                            type: 'multi_channels_select',
                            max_selected_items: 1
                        },
                        hint: {
                            type: 'plain_text',
                            text: 'Select the channel to notify when documents are generated'
                        }
                    }
                ]
            })
        }
    }
}
