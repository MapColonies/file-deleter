import { ITaskResponse, OperationStatus } from "@map-colonies/mc-priority-queue";
import { randUuid, randWord } from "@ngneat/falso";
import { NFSConfig, ProviderConfig, ProvidersConfig, S3Config, TaskParameters } from '../../src/common/interfaces';

const fakeNFSConfig = (name: string): NFSConfig => {
    return { type: 'NFS', pvPath: `./tests/helpers/${name}` };
};

const fakeS3Config = (bucket: string): S3Config => {
    return {
        type: 'S3',
        accessKeyId: 'minioadmin',
        secretAccessKey: 'mininoadmin',
        endpointUrl: 'http://127.0.0.1:9000',
        bucket,
        region: 'us-east-1',
        forcePathStyle: true,
        sslEnables: false,
        maxAttempts: 3,
        sigVersion: 'v4',
    };
};