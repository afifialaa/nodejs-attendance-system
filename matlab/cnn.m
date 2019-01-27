faceDatasetPath = fullfile('D:\', 'project', 'faces');
imds = imageDatastore(faceDatasetPath, ...
    'IncludeSubfolders',true,'LabelSource','foldernames');

%count of labels
labelCount = countEachLabel(imds);
count = size(labelCount, 1)


%size of images
img = readimage(imds,1);
size(img)

%dividing data into training and validation (70% training)
[imdsTrain,imdsValidation] = splitEachLabel(imds,0.7);

layers = [
    imageInputLayer([112 92 1])
    
    convolution2dLayer(3,8,'Padding',1)
    batchNormalizationLayer
    reluLayer
    
    maxPooling2dLayer(2,'Stride',2)
    
    convolution2dLayer(3,16,'Padding',1)
    batchNormalizationLayer
    reluLayer
    
    maxPooling2dLayer(2,'Stride',2)
    
    convolution2dLayer(3,32,'Padding',1)
    batchNormalizationLayer
    reluLayer
    
    fullyConnectedLayer(count)
    softmaxLayer
    classificationLayer];

options = trainingOptions('sgdm', ...
    'MaxEpochs',4, ...
    'ValidationData',imdsValidation, ...
    'ValidationFrequency',30, ...
    'Verbose',false, ...
    'Plots','training-progress', ...
    'CheckpointPath', 'D:\project\stored nets');

net = trainNetwork(imdsTrain,layers,options);

%classifying the validation set
[YPred,scores] = classify(net,imdsValidation);
YValidation = imdsValidation.Labels;
accuracy = mean(YPred == YValidation)

%***************************************************************
%*********resume training from checkpoint***********************

net2 = loadCheckpoint();
net3 = trainNetwork(imdsTrain,net2.net.Layers,options);

%***************************************************************
%***************************************************************

%classify images 
imgQuery = imread('D:/matlab/10.pgm');
label = classify(net, imgQuery);

