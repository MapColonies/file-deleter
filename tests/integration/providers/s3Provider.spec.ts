// import jsLogger from "@map-colonies/js-logger";
// import { randFileExt, randSentence, randWord } from "@ngneat/falso";
// import { container } from "tsyringe";
// import { ProviderManager } from "../../../src/common/interfaces";
// import { S3Helper } from "../../helpers/s3Helper";
// import { SERVICES } from "../../../src/common/constants";
// import { getApp } from "../../../src/app";
// import { getProviderManager } from "../../../src/common/providers/getProvider";
// import { mockS3tS3 } from "../../helpers/mockCreators";

// jest.useFakeTimers();

// describe('S3Provider', () => {
//     let providerManager: ProviderManager;
//     let s3Helper: S3Helper;

//     beforeAll(() => {
//         getApp({
//             override: [
//                 { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
//                 {
//                     token: SERVICES.PROVIDER_MANAGER,
//                     provider: {
//                         useFactory: (): ProviderManager => {
//                             return getProviderManager(mockS3tS3);
//                         },
//                     },
//                 },
//             ],
//         });

//         providerManager = container.resolve(SERVICES.PROVIDER_MANAGER);
//         s3Helper = new S3Helper(mockS3tS3.s3);
//     });

//     beforeEach(async () => {
//         await s3Helper.initialize();
//     });

//     afterEach(async () => {
//         await s3Helper.terminate();
//         jest.clearAllMocks();
//     });

//     describe('deleteFile', () => {
//         it('Should delete a file from S3', async () => {
//             const model = randWord();
//             const file = `${randWord()}.${randFileExt()}`;
//             await s3Helper.createFileOfModel(model, file);
//             const filePath = `${model}/${file}`;

//             const result = await providerManager.s3.deleteFile(filePath);
//             const fileExists = await s3Helper.ObjectExist(mockS3tS3.s3.bucket, filePath);

//             expect(result).toBeUndefined()

//         })
//     })

// })
