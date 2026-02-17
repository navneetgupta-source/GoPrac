import { CSSProperties } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { SlideShell } from '../../components/layout/SlideShell';
import { QuestionData } from '../../types/content';
import { PALETTE } from '../../lib/config';
import { AnimatedBlock } from '../../components/animations/AnimatedBlock';
import { NarrationAudio } from '../../components/audio/NarrationAudio';
import { useSlideChoreography } from '../../hooks/useChoreography';
import { AnimationBlock, BlockHighlight, SlideChoreography } from '../../types/choreography';

type CaseOverviewSlideProps = {
  caseTitle: string;
  question: QuestionData;
};

const cardStyle: CSSProperties = {

  backgroundColor: '#FFFFFF',
  borderRadius: 32,
  padding: 34,
  minHeight: 240,
};

const BASE_HEADING_SIZE = 34;
const BASE_TEXT_SIZE = 27; // Increased for scenario paragraph
const BASE_LIST_SIZE = 25; // Increased for 4-5 item lists

const headingStyle: CSSProperties = {
  fontWeight: 700,
  marginBottom: 18,
  color: '#000000',
  borderBottom: '3px solid #000000',
  display: 'inline-block',
  paddingBottom: 6,
};

export const CaseOverviewSlide: React.FC<CaseOverviewSlideProps> = ({
  caseTitle,
  question,
}) => {
  const { problem_summary } = question;
  const scenarioPoints = (problem_summary.scenario_points || []).filter(Boolean);
  const hasScenarioPoints = scenarioPoints.length > 0;
  const choreography = useSlideChoreography('case_overview');
  const frame = useCurrentFrame();
  
  // Simple font sizing - no complex calculations
  const scenarioFontSize = BASE_TEXT_SIZE;
  const businessRulesFontSize = BASE_LIST_SIZE;
  const dataFontSize = BASE_LIST_SIZE;
  const constraintsFontSize = BASE_LIST_SIZE;
  
  const getAnimation = (blockId: string): AnimationBlock | undefined => {
    if (!choreography) return undefined;
    return (choreography as SlideChoreography).animations?.find(
      (anim: AnimationBlock) => anim.blockId === blockId,
    );
  };

  const getHighlight = (blockId: string): BlockHighlight | undefined => {
    if (!choreography?.highlights) return undefined;
    return (choreography as SlideChoreography).highlights?.find(
      (h: BlockHighlight) => h.blockId === blockId,
    );
  };
  
  const focusValue = (highlight?: BlockHighlight) => {
    if (!highlight) return 0;
    const startFrame = highlight.startFrame ?? 0;
    const endFrame = highlight.endFrame ?? startFrame;
    if (frame < startFrame) return 0;
    if (frame > endFrame) return 0;
    return 1;
  };

  const problemHighlight = getHighlight('problem_scenario');
  const rulesHighlight = getHighlight('business_rules');
  const dataHighlight = getHighlight('data_simplified');
  const constraintsHighlight = getHighlight('performance_constraints');

  const focusProblem = focusValue(problemHighlight);
  const focusRules = focusValue(rulesHighlight);
  const focusData = focusValue(dataHighlight);
  const focusConstraints = focusValue(constraintsHighlight);

  const rawActiveFocus = Math.max(focusProblem, focusRules, focusData, focusConstraints);
  const focusThreshold = 0.05;
  const highlightWindows = choreography?.highlights || [];
  const windowEnds = highlightWindows.map((win) => win.endFrame);
  const lastFocusEnd = windowEnds.length ? Math.max(...windowEnds) : 0;
  const tailHoldFrames = 36;
  const tailStart = lastFocusEnd + tailHoldFrames;
  const tailMode = frame >= tailStart;
  const activeFocus = tailMode || rawActiveFocus < focusThreshold ? 0 : rawActiveFocus;
  const activeId =
    activeFocus === focusProblem ? 'problem_scenario' :
    activeFocus === focusRules ? 'business_rules' :
    activeFocus === focusData ? 'data_simplified' :
    activeFocus === focusConstraints ? 'performance_constraints' : null;

  const cameraTargets: Record<string, { x: number; y: number; scale: number }> = {
    problem_scenario: { x: 800, y: 420, scale: 1.75 },
    business_rules: { x: -800, y: 420, scale: 1.75 },
    data_simplified: { x: 800, y: -390, scale: 1.75 },
    performance_constraints: { x: -800, y: -390, scale: 1.75 },
  };

  const windowInFocus = tailMode
    ? null
    : highlightWindows.find(
        (win) => frame >= (win.startFrame ?? 0) && frame <= (win.endFrame ?? 0),
      );
  const focusBlockId = windowInFocus?.blockId || (activeFocus > 0 ? activeId : null);

  const target = tailMode || !focusBlockId ? { x: 0, y: 0, scale: 1 } : cameraTargets[focusBlockId];
  const effectiveFocus = tailMode ? 0 : activeFocus;
  const cameraScale = 1 + (target.scale - 1) * effectiveFocus;
  const cameraX = target.x * effectiveFocus;
  const cameraY = target.y * effectiveFocus;

  const getBlockOpacity = (blockId: string) => {
    if (tailMode) {
      return 1;
    }
    if (focusBlockId) {
      return focusBlockId === blockId ? 1 : 0;
    }
    if (activeFocus === 0) {
      return 1;
    }
    return activeId === blockId ? 1 : 0;
  };

  const blockInteractivity = (blockId: string) =>
    tailMode || !focusBlockId || focusBlockId === blockId ? 'auto' : 'none';

  const isBlockActive = (blockId: string) =>
    !tailMode && activeId === blockId && activeFocus >= focusThreshold;

  const problemOpacity = getBlockOpacity('problem_scenario');
  const rulesOpacity = getBlockOpacity('business_rules');
  const dataOpacity = getBlockOpacity('data_simplified');
  const constraintsOpacity = getBlockOpacity('performance_constraints');

  return (
    <SlideShell title={caseTitle} slideId="case_overview_slide">
      {choreography?.narration && (
        <NarrationAudio
          audioFile={choreography.narration.audioFile}
          startFrame={choreography.narration.startFrame}
          enabled={true}
        />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          height: '100%',
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
          transition: 'transform 360ms ease-out',
        }}
      >
        <AnimatedBlock
          animation={getAnimation('problem_scenario')}
          highlightStart={getHighlight('problem_scenario')?.startFrame}
          highlightEnd={getHighlight('problem_scenario')?.endFrame}
          highlightColor="#E6A100"
          style={{
            ...cardStyle,
            opacity: problemOpacity,
            visibility: problemOpacity <= 0.01 ? 'hidden' : 'visible',
            pointerEvents: blockInteractivity('problem_scenario'),
            boxShadow: isBlockActive('problem_scenario') ? '0 16px 36px rgba(0,0,0,0.14)' : 'none',
            transform: tailMode ? 'scale(1)' : `scale(${isBlockActive('problem_scenario') ? 1.02 : 1})`,
            transition: 'transform 220ms ease-out, opacity 200ms ease-out, box-shadow 220ms ease-out',
          }}
          data-morph-id="problem_scenario"
        >
          <div style={{...headingStyle, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Problem Scenario</div>
          {hasScenarioPoints ? (
            <ul style={{ fontSize: scenarioFontSize, lineHeight: 1.55, color: PALETTE.textBlack, margin: 0, paddingLeft: 22, fontWeight: 600 }}>
              {scenarioPoints.map((point) => (
                <li key={point} style={{ marginBottom: 8 }}>{point}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: scenarioFontSize, lineHeight: 1.55, color: PALETTE.textBlack, margin: 0, fontWeight: 600 }}>
              {problem_summary.scenario}
            </p>
          )}
        </AnimatedBlock>

        <AnimatedBlock
          animation={getAnimation('business_rules')}
          highlightStart={getHighlight('business_rules')?.startFrame}
          highlightEnd={getHighlight('business_rules')?.endFrame}
          highlightColor="#E6A100"
          style={{
            ...cardStyle,
            opacity: rulesOpacity,
            visibility: rulesOpacity <= 0.01 ? 'hidden' : 'visible',
            pointerEvents: blockInteractivity('business_rules'),
            boxShadow: isBlockActive('business_rules') ? '0 16px 36px rgba(0,0,0,0.14)' : 'none',
            transform: tailMode ? 'scale(1)' : `scale(${isBlockActive('business_rules') ? 1.02 : 1})`,
            transition: 'transform 220ms ease-out, opacity 200ms ease-out, box-shadow 220ms ease-out',
          }}
          data-morph-id="business_rules"
        >
          <div style={{...headingStyle, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Business rules</div>
          <ul style={{ fontSize: businessRulesFontSize, lineHeight: 1.6, color: PALETTE.textBlack, margin: 0, paddingLeft: 22, fontWeight: 600 }}>
            {problem_summary.business_rules.map((rule) => (
              <li key={rule} style={{ marginBottom: 8 }}>{rule}</li>
            ))}
          </ul>
        </AnimatedBlock>

        <AnimatedBlock
          animation={getAnimation('data_simplified')}
          highlightStart={getHighlight('data_simplified')?.startFrame}
          highlightEnd={getHighlight('data_simplified')?.endFrame}
          highlightColor="#E6A100"
          style={{
            ...cardStyle,
            opacity: dataOpacity,
            visibility: dataOpacity <= 0.01 ? 'hidden' : 'visible',
            pointerEvents: blockInteractivity('data_simplified'),
            boxShadow: isBlockActive('data_simplified') ? '0 16px 36px rgba(0,0,0,0.14)' : 'none',
            transform: tailMode ? 'scale(1)' : `scale(${isBlockActive('data_simplified') ? 1.02 : 1})`,
            transition: 'transform 220ms ease-out, opacity 200ms ease-out, box-shadow 220ms ease-out',
          }}
          data-morph-id="data_simplified"
        >
          <div style={{...headingStyle, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Data (simplified)</div>
          <ul style={{ fontSize: dataFontSize, lineHeight: 1.6, color: PALETTE.textBlack, margin: 0, paddingLeft: 22, fontWeight: 600 }}>
            {problem_summary.data.map((row) => (
              <li key={row} style={{ marginBottom: 8 }}>{row}</li>
            ))}
          </ul>
        </AnimatedBlock>

        <AnimatedBlock
          animation={getAnimation('performance_constraints')}
          highlightStart={getHighlight('performance_constraints')?.startFrame}
          highlightEnd={getHighlight('performance_constraints')?.endFrame}
          highlightColor="#E6A100"
          style={{
            ...cardStyle,
            opacity: constraintsOpacity,
            visibility: constraintsOpacity <= 0.01 ? 'hidden' : 'visible',
            pointerEvents: blockInteractivity('performance_constraints'),
            boxShadow: isBlockActive('performance_constraints') ? '0 16px 36px rgba(0,0,0,0.14)' : 'none',
            transform: tailMode ? 'scale(1)' : `scale(${isBlockActive('performance_constraints') ? 1.02 : 1})`,
            transition: 'transform 220ms ease-out, opacity 200ms ease-out, box-shadow 220ms ease-out',
          }}
          data-morph-id="performance_constraints"
        >
          <div style={{...headingStyle, fontSize: BASE_HEADING_SIZE, color: PALETTE.textBlack}}>Performance constraints</div>
          <ul style={{ fontSize: constraintsFontSize, lineHeight: 1.6, color: PALETTE.textBlack, margin: 0, paddingLeft: 22, fontWeight: 600 }}>
            {problem_summary.performance_constraints.map((item) => (
              <li key={item} style={{ marginBottom: 8 }}>{item}</li>
            ))}
          </ul>
        </AnimatedBlock>
      </div>
    </SlideShell>
  );
};
