import { CSSProperties } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { SlideShell } from '../../components/layout/SlideShell';
import { QuestionData } from '../../types/content';
import { PALETTE } from '../../lib/config';
import { AnimatedBlock } from '../../components/animations/AnimatedBlock';
import { NarrationAudio } from '../../components/audio/NarrationAudio';
import { useSlideChoreography } from '../../hooks/useChoreography';
import { AnimationBlock, SlideChoreography } from '../../types/choreography';
import { HighlightedText } from '../../components/text/HighlightedText';
import { getManifestEvents } from '../../lib/loadData';

type QuestionSummarySlideProps = {
  caseTitle: string;
  question: QuestionData;
};

const BASE_HEADING_SIZE = 26; // Mini card headings
const BASE_BODY_SIZE = 24; // Main question/feedback text
const BASE_SCORE_SIZE = 36; // Score badge
const BASE_LIST_SIZE = 20; // Mini card lists - reduced to prevent overflow

const miniCardStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: 30,
  padding: 30,
  minHeight: 190,
};

const underlineHeading: CSSProperties = {
  fontWeight: 700,
  marginBottom: 12,
  color: '#000000',
  borderBottom: '3px solid #000000',
  display: 'inline-block',
  paddingBottom: 4,
};

const rightCardStyle: CSSProperties = {
  backgroundColor: PALETTE.lighterAzure,
  borderRadius: 32,
  padding: 34,
  minHeight: 330, // Increased a bit more
};

const scoreBadge: CSSProperties = {
  marginTop: 8,
  alignSelf: 'center',
  backgroundColor: PALETTE.accentGreen,
  borderRadius: 26,
  padding: '40px 68px', // Slightly larger
  fontWeight: 700,
  color: '#f7fff9',
  textAlign: 'center',
  width: 'fit-content',
};

const scoreBadgeSubtitle: CSSProperties = {
  fontSize: 20,
  marginTop: 10,
  fontWeight: 600,
  letterSpacing: 0.5,
};

export const QuestionSummarySlide: React.FC<QuestionSummarySlideProps> = ({
  caseTitle,
  question,
}) => {
  const { problem_summary } = question;
  const scenarioPoints = (problem_summary.scenario_points || []).filter(Boolean);
  const hasScenarioPoints = scenarioPoints.length > 0;
  const feedbackPoints = (question.feedback_points || []).filter(Boolean);
  const hasFeedbackPoints = feedbackPoints.length > 0;
  const frame = useCurrentFrame();
  const choreography = useSlideChoreography('q1_summary');
  
  // Get keywords from manifest for highlighting
  const manifestEvents = getManifestEvents();
  const summaryEvent = manifestEvents.find(e => e.slide_type === 'q_summary');
  const keywords = (summaryEvent?.narration?.keywords || []).map(k => typeof k === 'string' ? k : k.text);
  
  // Simple font sizing
  const scenarioSize = BASE_BODY_SIZE;
  const dataSize = BASE_LIST_SIZE;
  const rulesSize = BASE_LIST_SIZE;
  const constraintsSize = BASE_LIST_SIZE;
  const questionSize = BASE_BODY_SIZE;
  const feedbackSize = BASE_BODY_SIZE;

  const getHighlight = (blockId: string) => {
    if (!choreography?.highlights) return undefined;
    return (choreography as SlideChoreography).highlights?.find((h) => h.blockId === blockId);
  };
  
  const getAnimation = (blockId: string): AnimationBlock | undefined => {
    if (!choreography) return undefined;
    return (choreography as SlideChoreography).animations?.find(
      (anim: AnimationBlock) => anim.blockId === blockId,
    );
  };
  
  // Counter animation for score - only animate when narration mentions the number
  const scoreNumberAnimation = getAnimation('score_number');
  const animatedScore = scoreNumberAnimation && frame >= scoreNumberAnimation.startFrame
    ? interpolate(
        frame,
        [scoreNumberAnimation.startFrame, scoreNumberAnimation.startFrame + scoreNumberAnimation.durationFrames],
        [0, question.score],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
      )
    : question.score; // Show final score if animation hasn't started

  const narrationOffset = choreography?.narration?.startFrame ?? 0;
  const shiftedWordTimings = choreography?.narration?.wordTimings?.map((t) => ({
    ...t,
    startFrame: t.startFrame + narrationOffset,
    endFrame: t.endFrame + narrationOffset,
  }));

  return (
    <SlideShell title={caseTitle} slideId="question_summary_slide">
      {choreography?.narration && (
        <NarrationAudio
          audioFile={choreography.narration.audioFile}
          startFrame={choreography.narration.startFrame}
          enabled={true}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, height: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
          <AnimatedBlock
            animation={getAnimation('problem_scenario')}
            highlightStart={getHighlight('problem_scenario')?.startFrame}
            highlightEnd={getHighlight('problem_scenario')?.endFrame}
            highlightColor="#E6A100"
            style={miniCardStyle}
          >
            <div data-morph-id="problem_scenario">
              <div style={{...underlineHeading, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Problem Scenario</div>
              {hasScenarioPoints ? (
                <ul style={{ fontSize: scenarioSize, lineHeight: 1.5, color: PALETTE.textBlack, margin: 0, paddingLeft: 22, fontWeight: 600 }}>
                  {scenarioPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: scenarioSize, lineHeight: 1.55, color: PALETTE.textBlack, margin: 0, fontWeight: 600 }}>
                  {problem_summary.scenario}
                </p>
              )}
            </div>
          </AnimatedBlock>
          <AnimatedBlock
            animation={getAnimation('data_simplified')}
            highlightStart={getHighlight('data_simplified')?.startFrame}
            highlightEnd={getHighlight('data_simplified')?.endFrame}
            highlightColor="#E6A100"
            style={miniCardStyle}
          >
            <div data-morph-id="data_simplified">
              <div style={{...underlineHeading, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Data (simplified)</div>
              <ul style={{ margin: 0, paddingLeft: 22, color: PALETTE.textBlack, fontSize: dataSize, lineHeight: 1.5, fontWeight: 600 }}>
                {problem_summary.data.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </AnimatedBlock>
          <AnimatedBlock
            animation={getAnimation('business_rules')}
            highlightStart={getHighlight('business_rules')?.startFrame}
            highlightEnd={getHighlight('business_rules')?.endFrame}
            highlightColor="#E6A100"
            style={miniCardStyle}
          >
            <div data-morph-id="business_rules">
              <div style={{...underlineHeading, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Business rules</div>
              <ul style={{ margin: 0, paddingLeft: 22, color: PALETTE.textBlack, fontSize: rulesSize, lineHeight: 1.5, fontWeight: 600 }}>
                {problem_summary.business_rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </AnimatedBlock>
          <AnimatedBlock
            animation={getAnimation('performance_constraints')}
            highlightStart={getHighlight('performance_constraints')?.startFrame}
            highlightEnd={getHighlight('performance_constraints')?.endFrame}
            highlightColor="#E6A100"
            style={miniCardStyle}
          >
            <div data-morph-id="performance_constraints">
              <div style={{...underlineHeading, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Performance constraints</div>
              <ul style={{ margin: 0, paddingLeft: 22, color: PALETTE.textBlack, fontSize: constraintsSize, lineHeight: 1.5, fontWeight: 600 }}>
                {problem_summary.performance_constraints.map((constraint) => (
                  <li key={constraint}>{constraint}</li>
                ))}
              </ul>
            </div>
          </AnimatedBlock>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Question Block - slides from right */}
          <AnimatedBlock
            animation={getAnimation('question_block')}
            highlightStart={getHighlight('question_block')?.startFrame}
            highlightEnd={getHighlight('question_block')?.endFrame}
            highlightColor="#E6A100"
            style={rightCardStyle}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: PALETTE.textBlack, marginBottom: 10 }}>
              Question {question.question_number}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: PALETTE.textBlack, marginBottom: 18 }}>
              {question.topic}
            </div>
            <p style={{ fontSize: questionSize, lineHeight: 1.55, color: PALETTE.textBlack, margin: 0, fontWeight: 600 }}>
              <HighlightedText
                text={question.question_prompt}
                keywords={keywords}
                wordTimings={shiftedWordTimings}
                highlightStyle="none"
              />
            </p>
          </AnimatedBlock>

          {/* Feedback Summary - slides from right */}
          <AnimatedBlock
            animation={getAnimation('feedback_block')}
            highlightStart={getHighlight('feedback_block')?.startFrame}
            highlightEnd={getHighlight('feedback_block')?.endFrame}
            highlightColor="#E6A100"
            style={rightCardStyle}
          >
            <div style={{ fontSize: 27, fontWeight: 700, color: PALETTE.textBlack, marginBottom: 12 }}>
              Feedback Summary
            </div>
            {hasFeedbackPoints ? (
              <ul style={{ fontSize: feedbackSize, lineHeight: 1.55, color: PALETTE.textBlack, margin: 0, paddingLeft: 22, fontWeight: 600 }}>
                {feedbackPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: feedbackSize, lineHeight: 1.55, color: PALETTE.textBlack, margin: 0, fontWeight: 600 }}>
                <HighlightedText
                  text={question.feedback_summary}
                  keywords={keywords}
                  wordTimings={shiftedWordTimings}
                  highlightStyle="none"
                />
              </p>
            )}
          </AnimatedBlock>

          {/* Score Badge - fades in */}
          <AnimatedBlock
            animation={getAnimation('score_badge')}
            style={scoreBadge}
          >
            <div style={{ fontSize: BASE_SCORE_SIZE }}>
              Your Score :{' '}
              {/* Score Number - counter animation triggers when narration says the number */}
              <span style={{ display: 'inline-block' }}>
                {scoreNumberAnimation && frame < scoreNumberAnimation.startFrame 
                  ? '...' 
                  : animatedScore.toFixed(1)}
              </span>
            </div>
            <div style={scoreBadgeSubtitle}>
              BELOW THE INDUSTRY LEVEL
            </div>
          </AnimatedBlock>
        </div>
      </div>
    </SlideShell>
  );
};
