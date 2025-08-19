import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Initialize OpenTelemetry SDK
export function initializeTracing() {


  // Initialize SDK with basic configuration
  const sdk = new NodeSDK({
    instrumentations: [
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
    ],
  });

  // Start the SDK
  sdk.start();
  
  console.log('OpenTelemetry initialized for ai-career-api');
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry terminated'))
      .catch((error: any) => console.log('Error terminating OpenTelemetry', error))
      .finally(() => process.exit(0));
  });
  
  return sdk;
}

// Helper function to get current trace context
export function getCurrentTraceContext() {
  const { trace, context } = require('@opentelemetry/api');
  const activeSpan = trace.getActiveSpan();
  
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceFlags: spanContext.traceFlags,
    };
  }
  
  return null;
}

// Helper function to create custom spans
export function createSpan(name: string, attributes?: Record<string, string | number | boolean>) {
  const { trace } = require('@opentelemetry/api');
  const tracer = trace.getTracer('ai-career-api');
  
  return tracer.startSpan(name, {
    attributes,
  });
}