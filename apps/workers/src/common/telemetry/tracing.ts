import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | null = null;

export function initializeTracing() {
  if (sdk) {
    return; // Already initialized
  }

  // Configure instrumentations with minimal setup
  const instrumentations = [
    getNodeAutoInstrumentations({
      // Disable file system instrumentation to reduce noise
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      // Configure HTTP instrumentation for better request tracking
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
    }),
  ];

  // Initialize SDK with basic configuration
  sdk = new NodeSDK({
    instrumentations,
  });

  // Start the SDK
  sdk.start();

  console.log('OpenTelemetry initialized for ai-career-workers');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    try {
      await sdk?.shutdown();
      console.log('OpenTelemetry terminated');
    } catch (error: any) {
      console.error('Error terminating OpenTelemetry', error);
    }
  });
}

export function getTracer() {
  const { trace } = require('@opentelemetry/api');
  return trace.getTracer('ai-career-workers');
}