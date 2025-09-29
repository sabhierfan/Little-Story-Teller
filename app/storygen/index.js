import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Platform, ScrollView, ActivityIndicator, Image, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DecorativeBackground from '../../assets/components/DecorativeBackground';
import StoryCard from './StoryCard';
import ProgressEggs from './ProgressEggs';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { buildStoryPrompt, callGeminiAPI, generateImagePromptsFromStory, generateImageFromPromptOpenAI } from '../utils/promptUtils';
import { saveStory } from '../utils/firestoreUtils';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';
import StoryView from '../components/StoryView';

const professions = [
  'Detective', 'Adventurer', 'Student', 'Wizard', 'Chef', 'Artist', 'Doctor', 'Pilot', 'Explorer', 'Inventor',
];
const relations = [
  'Brother', 'Sister', 'Father', 'Mother', 'Friend', 'Pet', 'Cousin', 'Grandparent', 'Teacher', 'Alien',
];
const settings = [
  'Forest', 'Ship', 'Island', 'Space Station', 'School', 'Village', 'Magic Castle', 'Underwater World',
];
const storyLengths = [
  { label: 'Short (1–2 mins)', value: 'short' },
  { label: 'Medium (3–5 mins)', value: 'medium' },
  { label: 'Long (5–10 mins)', value: 'long' },
];
const ages = Array.from({ length: 96 }, (_, i) => (i + 5).toString());

// Themed styles for DropDownPicker
const pickerThemeStyle = {
  backgroundColor: '#E6F0FF',
  borderColor: '#FFD93D',
  borderRadius: 12,
  minHeight: 44,
  minWidth: 120,
  paddingHorizontal: 12,
  textAlign: 'left',
};
const pickerDropdownThemeStyle = {
  backgroundColor: '#FFF9D6',
  borderColor: '#FFD93D',
  borderRadius: 12,
  zIndex: 1000,
};
const pickerTextStyle = {
  fontFamily: 'Poppins',
  fontSize: 16,
  color: '#222',
};
const pickerPlaceholderStyle = {
  color: '#888',
  fontFamily: 'Poppins',
};

const Step1 = ({ value, onChange, onNext, valid, ProgressEggsProps }) => (
  <StoryCard>
    <ProgressEggs {...ProgressEggsProps} />
    <Text style={styles.title}>Tell us the main idea!</Text>
    <TextInput
      style={styles.textArea}
      placeholder="Write the main idea of your story here..."
      placeholderTextColor="#fff"
      value={value}
      onChangeText={onChange}
      multiline
      numberOfLines={4}
    />
    <TouchableOpacity style={[styles.arrowBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
      <MaterialIcons name="arrow-forward-ios" size={28} color="#111" />
    </TouchableOpacity>
  </StoryCard>
);

const Step2 = ({ count, setCount, names, setNames, onNext, valid, ProgressEggsProps }) => {
  const handleCountChange = (val) => {
    let num = parseInt(val.replace(/[^0-9]/g, '')) || 1;
    if (num < 1) num = 1;
    if (num > 5) num = 5;
    setCount(num);
  };
  const increment = () => setCount(c => (c < 5 ? c + 1 : 5));
  const decrement = () => setCount(c => (c > 1 ? c - 1 : 1));

  return (
    <StoryCard>
      <ProgressEggs {...ProgressEggsProps} />
      <Text style={styles.title}>How many characters?</Text>
      <View style={styles.dropdownRow}>
        <Text style={styles.label}>Number:</Text>
        <TouchableOpacity onPress={decrement} style={{padding: 6, marginRight: 4}}>
          <MaterialIcons name="remove-circle-outline" size={24} color="#21b7c5" />
        </TouchableOpacity>
        <TextInput
          style={[styles.picker, {width: 40, textAlign: 'center'}]}
          value={count.toString()}
          onChangeText={handleCountChange}
          keyboardType="numeric"
          maxLength={1}
        />
        <TouchableOpacity onPress={increment} style={{padding: 6, marginLeft: 4}}>
          <MaterialIcons name="add-circle-outline" size={24} color="#21b7c5" />
        </TouchableOpacity>
      </View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.nameCard}>
          <Text style={styles.label}>{`Name ${i + 1}`}</Text>
          <TextInput
            style={styles.nameInput}
            value={names[i]}
            onChangeText={t => setNames(names.map((n, idx) => idx === i ? t : n))}
            placeholder={`Enter name ${i + 1}`}
            placeholderTextColor="#888"
          />
        </View>
      ))}
      <TouchableOpacity style={[styles.arrowBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
        <MaterialIcons name="arrow-forward-ios" size={28} color="#111" />
      </TouchableOpacity>
    </StoryCard>
  );
};

const Step3 = ({ count, details, setDetails, onNext, valid, ProgressEggsProps, names }) => {
  // Manage open state for each dropdown
  const [openProfession, setOpenProfession] = useState(Array(count).fill(false));
  const [openRelation, setOpenRelation] = useState(Array(count).fill(false));

  // Prepare dropdown items
  const professionItems = professions.map(p => ({ label: p, value: p }));
  const relationItems = relations.map(r => ({ label: r, value: r }));

  // Handlers for opening/closing dropdowns
  const handleOpenProfession = idx => {
    setOpenProfession(openProfession.map((v, i) => i === idx));
    setOpenRelation(Array(count).fill(false));
  };
  const handleOpenRelation = idx => {
    setOpenRelation(openRelation.map((v, i) => idx === i));
    setOpenProfession(Array(count).fill(false));
  };

  return (
    <StoryCard>
      <ProgressEggs {...ProgressEggsProps} />
      <Text style={styles.title}>Let's know more about your characters!</Text>
      <View style={{ maxHeight: 320 }}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={[styles.characterRow, styles.characterRowWhite, { zIndex: count - i }]}>
            <Text style={styles.characterName}>{names[i] || `Name ${i + 1}`}</Text>
            <View style={styles.characterPickerWrapper}>
              <View style={styles.characterPickerCard}>
                <DropDownPicker
                  open={openProfession[i]}
                  value={details[i]?.profession || null}
                  items={professionItems}
                  setOpen={v => setOpenProfession(openProfession.map((val, idx) => idx === i ? v : false))}
                  setValue={cb => setDetails(details.map((d, idx) => idx === i ? { ...d, profession: cb(null) } : d))}
                  setItems={() => {}}
                  placeholder="Profession"
                  style={pickerThemeStyle}
                  dropDownContainerStyle={pickerDropdownThemeStyle}
                  textStyle={pickerTextStyle}
                  placeholderStyle={pickerPlaceholderStyle}
                  onOpen={() => handleOpenProfession(i)}
                  zIndex={count * 2 - i}
                />
              </View>
              <View style={styles.characterPickerCard}>
                <DropDownPicker
                  open={openRelation[i]}
                  value={details[i]?.relation || null}
                  items={relationItems}
                  setOpen={v => setOpenRelation(openRelation.map((val, idx) => idx === i ? v : false))}
                  setValue={cb => setDetails(details.map((d, idx) => idx === i ? { ...d, relation: cb(null) } : d))}
                  setItems={() => {}}
                  placeholder="Relation"
                  style={pickerThemeStyle}
                  dropDownContainerStyle={pickerDropdownThemeStyle}
                  textStyle={pickerTextStyle}
                  placeholderStyle={pickerPlaceholderStyle}
                  onOpen={() => handleOpenRelation(i)}
                  zIndex={count * 2 - i - 1}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity style={[styles.arrowBtn, styles.fullWidthBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
        <Text style={styles.arrowBtnText}>Next</Text>
      </TouchableOpacity>
    </StoryCard>
  );
};

const Step4 = ({ setting, setSetting, onNext, valid, ProgressEggsProps }) => {
  const [open, setOpen] = useState(false);
  const settingItems = settings.map(s => ({ label: s, value: s }));
  return (
    <StoryCard>
      <ProgressEggs {...ProgressEggsProps} />
      <Text style={styles.title}>Where will the story happen?</Text>
      <View style={styles.dropdownRow}>
        <DropDownPicker
          open={open}
          value={setting}
          items={settingItems}
          setOpen={setOpen}
          setValue={cb => setSetting(cb(null))}
          setItems={() => {}}
          placeholder="Select a place..."
          style={pickerThemeStyle}
          dropDownContainerStyle={pickerDropdownThemeStyle}
          textStyle={pickerTextStyle}
          placeholderStyle={pickerPlaceholderStyle}
          zIndex={100}
        />
      </View>
      <TouchableOpacity style={[styles.arrowBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
        <MaterialIcons name="arrow-forward-ios" size={28} color="#111" />
      </TouchableOpacity>
    </StoryCard>
  );
};

const Step5 = ({ type, setType, onNext, valid, ProgressEggsProps }) => (
  <StoryCard>
    <ProgressEggs {...ProgressEggsProps} />
    <Text style={styles.title}>What type of story do you want?</Text>
    <View style={styles.typeRow}>
      <TouchableOpacity
        style={[styles.typeBtn, type === 'realistic' && styles.typeBtnActive]}
        onPress={() => setType('realistic')}
      >
        <MaterialCommunityIcons name="earth" size={32} color="#21b7c5" />
        <Text style={styles.typeBtnText}>Realistic</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.typeBtn, type === 'imaginative' && styles.typeBtnActive]}
        onPress={() => setType('imaginative')}
      >
        <MaterialCommunityIcons name="unicorn" size={32} color="#f66e9e" />
        <Text style={styles.typeBtnText}>Imaginative</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={[styles.arrowBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
      <MaterialIcons name="arrow-forward-ios" size={28} color="#111" />
    </TouchableOpacity>
  </StoryCard>
);

const Step6 = ({ length, setLength, onGenerate, valid, ProgressEggsProps }) => {
  const [open, setOpen] = useState(false);
  const lengthItems = storyLengths.map(l => ({ label: l.label, value: l.value }));
  return (
    <StoryCard>
      <ProgressEggs {...ProgressEggsProps} />
      <Text style={styles.title}>How long should the story be?</Text>
      <View style={styles.dropdownRow}>
        <DropDownPicker
          open={open}
          value={length}
          items={lengthItems}
          setOpen={setOpen}
          setValue={cb => setLength(cb(null))}
          setItems={() => {}}
          placeholder="Select length..."
          style={pickerThemeStyle}
          dropDownContainerStyle={pickerDropdownThemeStyle}
          textStyle={pickerTextStyle}
          placeholderStyle={pickerPlaceholderStyle}
          zIndex={100}
        />
      </View>
      <TouchableOpacity
        style={[styles.generateBtn, !valid && styles.arrowBtnDisabled]}
        onPress={onGenerate}
        disabled={!valid}
      >
        <Text style={styles.generateBtnText}>Generate Story</Text>
      </TouchableOpacity>
    </StoryCard>
  );
};

const Step7 = ({ story, images, onBack, loadingImages }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const paragraphs = story.split(/\n\n+/);
  const totalPages = Math.ceil(paragraphs.length / 2); // Each page has text and image

  const renderPage = (pageIndex) => {
    const textIndex = pageIndex * 2;
    const imageIndex = pageIndex;
    const hasNextPage = pageIndex < totalPages - 1;
    const hasPrevPage = pageIndex > 0;

    return (
      <View style={styles.pageContainer}>
        <View style={styles.pageContent}>
          <Text style={styles.pageNumber}>Page {pageIndex + 1}</Text>
          <Text style={styles.storyText}>{paragraphs[textIndex]}</Text>
          {images && images[imageIndex] && (
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: images[imageIndex].startsWith('data:image')
                    ? images[imageIndex]
                    : (images[imageIndex].startsWith('/') || images[imageIndex].startsWith('http'))
                      ? images[imageIndex]
                      : `data:image/png;base64,${images[imageIndex]}`
                }}
                style={styles.storyImage}
                resizeMode="contain"
              />
            </View>
          )}
          {paragraphs[textIndex + 1] && (
            <Text style={styles.storyText}>{paragraphs[textIndex + 1]}</Text>
          )}
        </View>
        <View style={styles.pageNavigation}>
          <TouchableOpacity 
            style={[styles.navButton, !hasPrevPage && styles.navButtonDisabled]} 
            onPress={() => setCurrentPage(p => p - 1)}
            disabled={!hasPrevPage}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color={hasPrevPage ? "#111" : "#ccc"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, !hasNextPage && styles.navButtonDisabled]} 
            onPress={() => setCurrentPage(p => p + 1)}
            disabled={!hasNextPage}
          >
            <MaterialIcons name="arrow-forward-ios" size={24} color={hasNextPage ? "#111" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <StoryCard>
      <Text style={styles.title}>Your Story Book</Text>
      {loadingImages ? (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <ActivityIndicator size="large" color="#FFD93D" />
          <Text style={styles.loadingText}>Generating images...</Text>
        </View>
      ) : (
        renderPage(currentPage)
      )}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>Generate Another Story</Text>
      </TouchableOpacity>
    </StoryCard>
  );
};

const FunLoader = () => (
  <View style={styles.funLoaderContainer}>
    <View style={styles.funLoaderCharacters}>
      <Image source={require('../../assets/c1.png')} style={styles.funLoaderChar} />
      <Image source={require('../../assets/c4.png')} style={styles.funLoaderChar} />
      <Image source={require('../../assets/c3.png')} style={styles.funLoaderChar} />
    </View>
    <ActivityIndicator size="large" color="#FFD93D" style={{ marginVertical: 16 }} />
    <Text style={styles.funLoaderText}>Cooking up your magical story...</Text>
    <Text style={styles.funLoaderSubtext}>Get ready for an adventure! 🐻🐭🧙‍♂️</Text>
  </View>
);

const StoryGen = () => {
  const [step, setStep] = useState(1);
  const [mainIdea, setMainIdea] = useState('');
  const [charCount, setCharCount] = useState(1);
  const [charNames, setCharNames] = useState(['']);
  const [charDetails, setCharDetails] = useState([{ relation: '', profession: '', age: '' }]);
  const [setting, setSetting] = useState('');
  const [storyType, setStoryType] = useState('');
  const [storyLength, setStoryLength] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [error, setError] = useState('');
  const [imagePrompts, setImagePrompts] = useState([]);
  const [storyImages, setStoryImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  // Keep charNames and charDetails in sync with charCount
  React.useEffect(() => {
    setCharNames(names => Array.from({ length: charCount }, (_, i) => names[i] || ''));
    setCharDetails(details => Array.from({ length: charCount }, (_, i) => details[i] || { relation: '', profession: '', age: '' }));
  }, [charCount]);

  // Validation for each step
  const validStep1 = mainIdea.trim().length > 0;
  const validStep2 = charNames.every(n => n.trim().length > 0);
  const validStep3 = charDetails.every(d => d.relation && d.profession);
  const validStep4 = !!setting;
  const validStep5 = !!storyType;
  const validStep6 = !!storyLength;

  const next = () => setStep(s => s + 1);
  
  const onGenerate = async () => {
    if (!mainIdea) {
      setError('Please enter a story first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setImagePrompts([]);
    setStoryImages([]);
    setLoadingImages(false);

    try {
      const prompt = buildStoryPrompt({
        mainIdea,
        charNames,
        charDetails,
        setting,
        storyType,
        storyLength
      });
      
      const story = await callGeminiAPI(prompt);
      setGeneratedStory(story);
      setStep(7); // Move to the story display step

      // Start image prompt and image generation in the background
      setLoadingImages(true);
      const imagePrompts = await generateImagePromptsFromStory(story, storyLength);
      setImagePrompts(imagePrompts);

      // Generate images using the prompts
      const images = [];
      for (let i = 0; i < imagePrompts.length; i++) {
        let promptText = imagePrompts[i];
        // If it's an object, extract the string
        if (typeof promptText === 'object' && promptText !== null) {
          promptText = promptText.prompt || promptText.text || JSON.stringify(promptText);
        }
        console.log('Image prompt for OpenAI:', promptText);
        const img = await generateImageFromPromptOpenAI(promptText);
        console.log('Generated image data:', img);
        images.push(img);
        setStoryImages([...images]); // update as each image is ready
      }

      // Save story data to Firestore with image prompts and generated images
      const storyData = {
        mainIdea,
        charNames,
        charDetails,
        setting,
        storyType,
        storyLength,
        prompt,
        generatedStory: story,
        imagePrompts: imagePrompts,
        images: images // Save the generated images
      };
      await saveStory(storyData);
      
      setGeneratedImages(images);
      setShowGenerated(true);
    } catch (err) {
      setError('Failed to generate story or images. Please try again.');
      console.error('Story/image generation error:', err);
      setLoadingImages(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImages = async () => {
    if (!generatedStory) return;
    
    setLoadingImages(true);
    try {
      const imagePrompts = await generateImagePromptsFromStory(generatedStory);
      const newImages = await Promise.all(
        imagePrompts.map(async (prompt) => {
          const imageUrl = await generateImageFromPromptOpenAI(prompt);
          return imageUrl;
        })
      );
      setGeneratedImages(newImages);
    } catch (error) {
      console.error('Error regenerating images:', error);
      setError('Failed to regenerate images. Please try again.');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleStepChange = (targetStep) => {
    if (targetStep <= step) {
      setStep(targetStep);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground>
        <View style={styles.container}>
          {step === 1 && (
            <Step1 value={mainIdea} onChange={setMainIdea} onNext={next} valid={validStep1} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 2 && (
            <Step2 count={charCount} setCount={setCharCount} names={charNames} setNames={setCharNames} onNext={next} valid={validStep2} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 3 && (
            <Step3 count={charCount} details={charDetails} setDetails={setCharDetails} onNext={next} valid={validStep3} ProgressEggsProps={{ step, onStepChange: handleStepChange }} names={charNames} />
          )}
          {step === 4 && (
            <Step4 setting={setting} setSetting={setSetting} onNext={next} valid={validStep4} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 5 && (
            <Step5 type={storyType} setType={setStoryType} onNext={next} valid={validStep5} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 6 && (
            <Step6 length={storyLength} setLength={setStoryLength} onGenerate={onGenerate} valid={validStep6} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 7 && (
            <StoryView
              story={generatedStory}
              images={storyImages}
              onClose={() => {
                setStep(1);
                setShowGenerated(false);
                setGeneratedStory(null);
                setStoryImages([]);
              }}
              onRegenerateImages={handleRegenerateImages}
            />
          )}
          {isGenerating && (
            <FunLoader />
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onGenerate}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </DecorativeBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6E6FA',
  },
  container: {
    ...responsiveStyles.container,
  },
  title: {
    fontFamily: 'Fredoka',
    fontSize: fontSize.xxxlarge,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.large,
    color: '#222',
    marginBottom: spacing.small,
  },
  stepDescription: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#666',
    marginBottom: spacing.medium,
  },
  input: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#222',
    backgroundColor: '#f5f5f5',
    borderRadius: borderRadius.small,
    padding: spacing.medium,
    marginBottom: spacing.small,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  buttonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#222',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#222',
    marginTop: spacing.small,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  retryButton: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
  },
  retryButtonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#222',
  },
  funLoaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  funLoaderText: {
    fontFamily: 'Fredoka',
    fontSize: fontSize.xlarge,
    color: '#222',
    marginTop: spacing.medium,
  },
  funLoaderSubtext: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#666',
    marginTop: spacing.small,
    textAlign: 'center',
    paddingHorizontal: spacing.large,
  },
  textArea: {
    backgroundColor: '#21b7c5',
    color: '#fff',
    borderRadius: 20,
    padding: 18,
    fontSize: 16,
    minHeight: 90,
    marginBottom: 18,
    fontFamily: 'PoppinsBold',
  },
  arrowBtn: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  arrowBtnDisabled: {
    opacity: 0.4,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  picker: {
    flex: 1,
    height: 40,
    color: '#111',
    fontFamily: 'PoppinsBold',
  },
  pickerSmall: {
    width: 110,
    height: 40,
    color: '#111',
    fontFamily: 'PoppinsBold',
  },
  label: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#111',
    marginRight: 8,
  },
  nameCard: {
    backgroundColor: '#cceeff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 18,
  },
  typeBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 8,
    flex: 1,
    borderWidth: 2,
    borderColor: '#eee',
  },
  typeBtnActive: {
    borderColor: '#21b7c5',
    backgroundColor: '#e0f7fa',
  },
  typeBtnText: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#111',
    marginTop: 6,
  },
  generateBtn: {
    marginTop: 24,
    backgroundColor: '#FFD93D',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  generateBtnText: {
    color: '#fff',
    fontFamily: 'Fredoka',
    fontSize: 22,
    letterSpacing: 1,
    fontWeight: 'bold',
    textShadowColor: '#0002',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9D6',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  characterName: {
    fontFamily: 'Fredoka',
    fontSize: 17,
    color: '#222',
    marginRight: 10,
    flexShrink: 0,
  },
  characterPickerWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  characterPickerCard: {
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 2,
    paddingVertical: 0,
    justifyContent: 'center',
    minWidth: 120,
    maxWidth: 180,
  },
  characterPicker: {
    width: '100%',
    color: '#222',
    fontFamily: 'Poppins',
    fontSize: 16,
    flex: 1,
  },
  storyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    maxHeight: 400,
  },
  storyText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    lineHeight: 24,
    color: '#222',
  },
  backBtn: {
    backgroundColor: '#FFD93D',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  backBtnText: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#222',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  pageContent: {
    flex: 1,
  },
  pageNumber: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#222',
    marginBottom: 8,
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  navButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#fff',
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  storyImage: {
    width: 260,
    height: 180,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  characterRowWhite: { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 10 },
  fullWidthBtn: { width: '100%', alignSelf: 'center', marginTop: 18 },
  arrowBtnText: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#fff',
  },
});

export default StoryGen; 