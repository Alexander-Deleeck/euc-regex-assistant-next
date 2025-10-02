import { Step } from 'react-joyride';

/**
 * Joyride Tutorial Steps Configuration
 * 
 * This file defines the interactive tutorial steps for the Create Pattern page.
 * Each step targets specific UI elements and provides guidance to users.
 */

export const createPageJoyrideSteps: Step[] = [
  {
    target: '.joyride-sidebar',
    content: 'This is the sidebar where you configure your pattern.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.joyride-description-section',
    title: (
      <div className="text-cyan-800">
        <h2><strong>Describe your pattern here</strong></h2>
      </div>
    ),
    content: (
      <div className="text-left space-y-2">
        <p>
          Describe your pattern here using plain text or rich text. Try to be as specific as possible.
        </p>
        <p>
          For example, if you want to replace short dates (<code>D/M/YY</code>) with long dates (<code>DD/MM/YYYY</code>), 
          but want to ensure that unrelated things in a similar format are matched, you might state your descriptions as follows:
        </p>
        <ul className="pt-2 list-disc pl-5">
          <li>
            <i>"I want a regex pattern that matches short dates in the format <code>D/M/YY</code> or <code>DD/M/YY</code> with long dates <code>DD/MM/YYYY</code>, 
            but ensure that if a similar thing is used with a similar format, but a period <code>'.'</code> as separator, it will not be matched."</i>
          </li>
          <li>
            <i>The pattern should also match short dates with a dash <code>'-'</code> as a separator.</i>
          </li>
          <li>
            <i>The replacement pattern should always use the <code>'/'</code> as a separator.</i>
          </li>
        </ul>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.joyride-options-generate',
    content: 'Select your options and click the button to generate the RegEx patterns.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.joyride-pattern-results',
    content: 'In this section, the generated RegEx patterns will appear, and below you will find a detailed explanation of how the patterns work.',
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: '.joyride-test-tabs',
    content: 'Here you can test the newly generated RegEx patterns on a sample text or on a file you upload.',
    placement: 'left',
    disableBeacon: true,
  },
];


/**
 * Default Joyride styles configuration
 */
export const joyrideStyles = {
  options: {
    zIndex: 10000,
  },
};

