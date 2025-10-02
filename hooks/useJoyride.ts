import { useState } from 'react';
import { CallBackProps, STATUS } from 'react-joyride';

/**
 * Custom hook for managing Joyride tutorial state
 * 
 * This hook encapsulates the logic for controlling an interactive tutorial,
 * making it reusable across different pages.
 * 
 * @returns Object containing tutorial state and control functions
 */
export function useJoyride() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  /**
   * Start the tutorial from the beginning
   */
  const startTutorial = () => {
    setRun(true);
    setStepIndex(0);
  };

  /**
   * Stop the tutorial and reset to first step
   */
  const stopTutorial = () => {
    setRun(false);
    setStepIndex(0);
  };

  /**
   * Callback handler for Joyride events
   * Handles step progression, completion, and skipping
   */
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, status, type } = data;
    
    // Tutorial finished or skipped
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTutorial();
    } 
    // Step progression
    else if (type === 'step:after' || type === 'error:target_not_found') {
      if (action === 'next') {
        setStepIndex((prev) => prev + 1);
      }
      if (action === 'prev') {
        setStepIndex((prev) => prev - 1);
      }
    }
  };

  return {
    run,
    stepIndex,
    startTutorial,
    stopTutorial,
    handleJoyrideCallback,
  };
}

