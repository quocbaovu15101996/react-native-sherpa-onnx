export interface ModelLicense {
    asset_name: string;
    license_type: string;
    commercial_use: 'yes' | 'no' | 'conditional' | 'restricted' | 'unknown';
    confidence: string;
    detection_source: string;
    license_file: string;
}
export declare function getModelLicenses(): Promise<ModelLicense[]>;
//# sourceMappingURL=licenses.d.ts.map