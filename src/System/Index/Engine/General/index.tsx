import { EmulationCoreEngine } from '../../../Engine/General';
import { VectorMath, CurvatureEngine } from '../../../Engine/Mathematics/General';
import { PhysicsCalculator } from '../../../Engine/Science/Physics/General';
import { InputEngine } from '../../../Engine/Input/General';

export class IntegratedSystemEngineRegistry {
  public coreClock: EmulationCoreEngine;
  public mathUnit: typeof VectorMath;
  public pathCurvature: typeof CurvatureEngine;
  public physicsUnit: typeof PhysicsCalculator;
  public inputs: InputEngine;

  constructor() {
    this.coreClock = new EmulationCoreEngine();
    this.mathUnit = VectorMath;
    this.pathCurvature = CurvatureEngine;
    this.physicsUnit = PhysicsCalculator;
    this.inputs = new InputEngine();
  }
}
