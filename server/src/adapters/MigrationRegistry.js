import { JQueryToReactAdapter } from './web/jqueryToReactAdapter.js';
import { VueToReactAdapter } from './web/vueToReactAdapter.js';
import { AngularToReactAdapter } from './web/angularToReactAdapter.js';
import { PhpToLaravelAdapter } from './backend/phpToLaravelAdapter.js';
import { JavaToSpringAdapter } from './backend/javaToSpringAdapter.js';
import { PythonToFastApiAdapter } from './backend/pythonToFastApiAdapter.js';
import { RubyToRailsAdapter } from './backend/rubyToRailsAdapter.js';
import { AndroidJavaToKotlinAdapter } from './mobile/androidJavaToKotlinAdapter.js';
import { ReactNativeModernizationAdapter } from './mobile/reactNativeModernizationAdapter.js';
import { LegacyMobileAdapter } from './mobile/legacyMobileAdapter.js';
import { SchemaModernizationAdapter } from './data/schemaModernizationAdapter.js';
import { DatabaseMigrationAdapter } from './data/databaseMigrationAdapter.js';
import { ApiModernizationAdapter } from './data/apiModernizationAdapter.js';
import { InfrastructureModernizationAdapter } from './infrastructure/infrastructureModernizationAdapter.js';
import { LegacyCloudConfigAdapter } from './infrastructure/legacyCloudConfigAdapter.js';

class MigrationRegistryService {
  constructor() {
    this.adapters = new Map();
    this.registerDefaults();
  }

  register(adapter) {
    this.adapters.set(adapter.id, adapter);
  }

  registerDefaults() {
    // Web Adapters
    this.register(new JQueryToReactAdapter());
    this.register(new VueToReactAdapter());
    this.register(new AngularToReactAdapter());

    // Backend Adapters
    this.register(new PhpToLaravelAdapter());
    this.register(new JavaToSpringAdapter());
    this.register(new PythonToFastApiAdapter());
    this.register(new RubyToRailsAdapter());

    // Mobile Adapters
    this.register(new AndroidJavaToKotlinAdapter());
    this.register(new ReactNativeModernizationAdapter());
    this.register(new LegacyMobileAdapter());

    // Data Adapters
    this.register(new SchemaModernizationAdapter());
    this.register(new DatabaseMigrationAdapter());
    this.register(new ApiModernizationAdapter());

    // Infrastructure Adapters
    this.register(new InfrastructureModernizationAdapter());
    this.register(new LegacyCloudConfigAdapter());
  }

  getAdapter(id) {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      // Fallback to jquery-to-react if unknown ID requested
      return this.adapters.get('jquery-to-react');
    }
    return adapter;
  }

  getAllAdapters() {
    return Array.from(this.adapters.values());
  }

  getAdaptersByCategory(category) {
    return this.getAllAdapters().filter(a => a.category === category);
  }

  getAdaptersForSource(sourceTech) {
    const sourceLower = sourceTech.toLowerCase();
    return this.getAllAdapters().filter(a => a.source.toLowerCase().includes(sourceLower));
  }
}

export const migrationRegistry = new MigrationRegistryService();
