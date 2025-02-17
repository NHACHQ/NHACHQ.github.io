/**
 * jsPsych plugin for showing animations and recording keyboard responses
 * Josh de Leeuw
 * added response end trial function
 *
 * documentation: docs.jspsych.org
 */

//should I change this to general template for plugins?
jsPsych.plugins["animation-response"] = (function() {
//jsPsych.plugins.animation = (function() {
  var plugin = {};

  jsPsych.pluginAPI.registerPreload('animation', 'stimuli', 'image');

  plugin.info = {
    name: 'animation-response',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'The images to be displayed.'
      },
      frame_time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Frame time',
        default: 250,
        description: 'Duration to display each image.'
      },
      frame_isi: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Frame gap',
        default: 0,
        description: 'Length of gap to be shown between each image.'
      },
      sequence_reps: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sequence repetitions',
        default: 1,
        description: 'Number of times to show entire sequence.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        array: true,
        description: 'Keys subject uses to respond to stimuli.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below stimulus.'
      },
      response_ends_trial: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Response ends trial',
          default: false,
          description: 'If true, trial will end when subject makes a response.'
      },
      buffer: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'buffer time',
          default: 50,
          description: 'The buffer time before ending trial'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var interval_time = trial.frame_time + trial.frame_isi;
    var animate_frame = -1;
    var reps = 0;
    var startTime = performance.now();
    var animation_sequence = [];
    var responses = [];
    var current_stim = "";

    var animate_interval = setInterval(function() {
      var showImage = true;
      display_element.innerHTML = ''; // clear everything
      animate_frame++;
      if (animate_frame == trial.stimuli.length) {
        animate_frame = 0;
        reps++;
        if (reps >= trial.sequence_reps) {
          endTrial();
          clearInterval(animate_interval);
          showImage = false;
        }
      }
      if (showImage) {
        show_next_frame();
      }
    }, interval_time);


    function show_next_frame() {
      // show image
      display_element.innerHTML = '<img src="'+trial.stimuli[animate_frame]+'" id="jspsych-animation-image"></img>';

      current_stim = trial.stimuli[animate_frame];

      // record when image was shown
      animation_sequence.push({
        "stimulus": trial.stimuli[animate_frame],
        "time": performance.now() - startTime
      });

      if (trial.prompt !== null) {
        display_element.innerHTML += trial.prompt;
      }

      if (trial.frame_isi > 0) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspsych-animation-image').style.visibility = 'hidden';
          current_stim = 'blank';
          // record when blank image was shown
          animation_sequence.push({
            "stimulus": 'blank',
            "time": performance.now() - startTime
          });
        }, trial.frame_time);
      }
    }

// function borrowed from image-keyboard-response
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "animation_sequence": JSON.stringify(animation_sequence),
        "responses": JSON.stringify(responses)
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };


    var after_response = function(info) {

      responses.push({
        key_press: info.key,
        rt: info.rt,
        stimulus: current_stim
      });

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-animation-image').className += ' responded';

      if (trial.response_ends_trial) {
        jsPsych.pluginAPI.setTimeout(endTrial(), trial.buffer);
        //endTrial();
        clearInterval(animate_interval);
        showImage = false;
      }

    }

    // hold the jspsych response listener object in memory
    // so that we can turn off the response collection when
    // the trial ends
    var response_listener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'performance',
      persist: true,
      allow_held_key: false
    });


    function endTrial() {

      jsPsych.pluginAPI.cancelKeyboardResponse(response_listener);

      var trial_data = {
        //"animation_sequence": JSON.stringify(animation_sequence),
        "responses": JSON.stringify(responses)
      };

      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
