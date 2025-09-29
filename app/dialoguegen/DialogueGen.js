import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DecorativeBackground from '../../assets/components/DecorativeBackground';
import ProgressEggs from '../../app/storygen/ProgressEggs';
import { buildDialoguePrompt, callGeminiAPI } from '../utils/promptUtils';
import { saveDialogue } from '../utils/firestoreUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';

const professions = [
  'Detective', 'Adventurer', 'Student', 'Wizard', 'Chef', 'Artist', 'Doctor', 'Pilot', 'Explorer', 'Inventor',
];
const ages = Array.from({ length: 96 }, (_, i) => (i + 5).toString());
const lengths = [
  { label: 'Short (1–2 mins)', value: 'short' },
  { label: 'Medium (3–5 mins)', value: 'medium' },
  { label: 'Long (5–10 mins)', value: 'long' },
];
const creativities = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

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

const ProgressEggsDialogue = ({ step, onStepChange }) => (
  <ProgressEggs step={step} onStepChange={onStepChange} />
);

const Step1 = ({ value, onChange, onNext, valid, ProgressEggsProps }) => (
  <View style={styles.card}>
    <ProgressEggsDialogue {...ProgressEggsProps} />
    <Text style={styles.title}>What is the conversation about?</Text>
    <TextInput
      style={styles.textArea}
      placeholder="Describe the topic of the conversation..."
      placeholderTextColor="#888"
      value={value}
      onChangeText={onChange}
      multiline
      numberOfLines={4}
      returnKeyType="done"
      blurOnSubmit={true}
    />
    <Text style={styles.helperText}>Tap Next when you are done.</Text>
    <TouchableOpacity style={[styles.arrowBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
      <Text style={styles.arrowBtnText}>Next</Text>
    </TouchableOpacity>
  </View>
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
    <View style={styles.card}>
      <ProgressEggsDialogue {...ProgressEggsProps} />
      <Text style={styles.title}>How many characters?</Text>
      <View style={styles.dropdownRow}>
        <Text style={styles.label}>Number:</Text>
        <TouchableOpacity onPress={decrement} style={{padding: 6, marginRight: 4}}>
          <Text style={styles.arrowBtnText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.picker, {width: 40, textAlign: 'center'}]}
          value={count.toString()}
          onChangeText={handleCountChange}
          keyboardType="numeric"
          maxLength={1}
        />
        <TouchableOpacity onPress={increment} style={{padding: 6, marginLeft: 4}}>
          <Text style={styles.arrowBtnText}>+</Text>
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
        <Text style={styles.arrowBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const Step3 = ({ count, details, setDetails, onNext, valid, ProgressEggsProps, names }) => {
  const [openAge, setOpenAge] = useState(Array(count).fill(false));
  const [openProfession, setOpenProfession] = useState(Array(count).fill(false));
  const ageItems = ages.map(a => ({ label: a, value: a }));
  const professionItems = professions.map(p => ({ label: p, value: p }));
  const handleOpenAge = idx => {
    setOpenAge(openAge.map((v, i) => i === idx));
    setOpenProfession(Array(count).fill(false));
  };
  const handleOpenProfession = idx => {
    setOpenProfession(openProfession.map((v, i) => i === idx));
    setOpenAge(Array(count).fill(false));
  };
  return (
    <View style={styles.card}>
      <ProgressEggsDialogue {...ProgressEggsProps} />
      <Text style={styles.title}>Set age and profession for each character</Text>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.characterRow, styles.characterRowWhite, { zIndex: count - i }]}>
          <Text style={styles.characterName}>{names[i] || `Name ${i + 1}`}</Text>
          <View style={styles.characterPickerWrapper}>
            <View style={styles.characterPickerCard}>
              <DropDownPicker
                open={openAge[i]}
                value={details[i]?.age || null}
                items={ageItems}
                setOpen={v => setOpenAge(openAge.map((val, idx) => idx === i ? v : false))}
                setValue={cb => setDetails(details.map((d, idx) => idx === i ? { ...d, age: cb(null) } : d))}
                setItems={() => {}}
                placeholder="Age"
                style={pickerThemeStyle}
                dropDownContainerStyle={pickerDropdownThemeStyle}
                textStyle={pickerTextStyle}
                placeholderStyle={pickerPlaceholderStyle}
                onOpen={() => handleOpenAge(i)}
                zIndex={count * 2 - i}
              />
            </View>
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
                zIndex={count * 2 - i - 1}
              />
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity style={[styles.arrowBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
        <Text style={styles.arrowBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const Step4 = ({ length, setLength, onNext, valid, ProgressEggsProps }) => {
  const [open, setOpen] = useState(false);
  const lengthItems = lengths.map(l => ({ label: l.label, value: l.value }));
  return (
    <View style={styles.card}>
      <ProgressEggsDialogue {...ProgressEggsProps} />
      <Text style={styles.title}>How long should the dialogue be?</Text>
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
      <TouchableOpacity style={[styles.arrowBtn, !valid && styles.arrowBtnDisabled]} onPress={onNext} disabled={!valid}>
        <Text style={styles.arrowBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const Step5 = ({ creativity, setCreativity, onGenerate, valid, ProgressEggsProps }) => {
  const [open, setOpen] = useState(false);
  const creativityItems = creativities.map(c => ({ label: c.label, value: c.value }));
  return (
    <View style={styles.card}>
      <ProgressEggsDialogue {...ProgressEggsProps} />
      <Text style={styles.title}>How creative should the dialogue be?</Text>
      <View style={styles.dropdownRow}>
        <DropDownPicker
          open={open}
          value={creativity}
          items={creativityItems}
          setOpen={setOpen}
          setValue={cb => setCreativity(cb(null))}
          setItems={() => {}}
          placeholder="Select creativity..."
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
        <Text style={styles.generateBtnText}>Generate Dialogue</Text>
      </TouchableOpacity>
    </View>
  );
};

const Step6 = ({ dialogue, onBack }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Your Generated Dialogue</Text>
    <ScrollView style={styles.dialogueContainer}>
      <Text style={styles.dialogueText}>{dialogue}</Text>
    </ScrollView>
    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
      <Text style={styles.backBtnText}>Generate Another Dialogue</Text>
    </TouchableOpacity>
  </View>
);

const DialogueGen = () => {
  const [step, setStep] = useState(1);
  const [about, setAbout] = useState('');
  const [charCount, setCharCount] = useState(1);
  const [charNames, setCharNames] = useState(['']);
  const [charDetails, setCharDetails] = useState([{ age: '', profession: '' }]);
  const [length, setLength] = useState('');
  const [creativity, setCreativity] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDialogue, setGeneratedDialogue] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setCharNames(names => Array.from({ length: charCount }, (_, i) => names[i] || ''));
    setCharDetails(details => Array.from({ length: charCount }, (_, i) => details[i] || { age: '', profession: '' }));
  }, [charCount]);

  const validStep1 = about.trim().length > 0;
  const validStep2 = charNames.every(n => n.trim().length > 0);
  const validStep3 = charDetails.every(d => d.age && d.profession);
  const validStep4 = !!length;
  const validStep5 = !!creativity;

  const next = () => setStep(s => s + 1);
  
  const onGenerate = async () => {
    try {
      setIsGenerating(true);
      setError('');
      
      const prompt = buildDialoguePrompt({
        about,
        charNames,
        charDetails,
        length,
        creativity
      });
      
      const dialogue = await callGeminiAPI(prompt);
      setGeneratedDialogue(dialogue);
      setStep(6); // Move to the dialogue display step

      // Save dialogue data to Firestore
      const dialogueData = {
        about,
        charNames,
        charDetails,
        length,
        creativity,
        prompt,
        generatedDialogue: dialogue
      };
      await saveDialogue(dialogueData);
    } catch (err) {
      setError('Failed to generate dialogue. Please try again.');
      console.error('Dialogue generation error:', err);
    } finally {
      setIsGenerating(false);
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
            <Step1 value={about} onChange={setAbout} onNext={next} valid={validStep1} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 2 && (
            <Step2 count={charCount} setCount={setCharCount} names={charNames} setNames={setCharNames} onNext={next} valid={validStep2} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 3 && (
            <Step3 count={charCount} details={charDetails} setDetails={setCharDetails} onNext={next} valid={validStep3} ProgressEggsProps={{ step, onStepChange: handleStepChange }} names={charNames} />
          )}
          {step === 4 && (
            <Step4 length={length} setLength={setLength} onNext={next} valid={validStep4} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 5 && (
            <Step5 creativity={creativity} setCreativity={setCreativity} onGenerate={onGenerate} valid={validStep5} ProgressEggsProps={{ step, onStepChange: handleStepChange }} />
          )}
          {step === 6 && (
            <Step6 dialogue={generatedDialogue} onBack={() => setStep(1)} />
          )}
          {isGenerating && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFD93D" />
              <Text style={styles.loadingText}>Generating your dialogue...</Text>
            </View>
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
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
  card: {
    backgroundColor: '#FFE088',
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginVertical: spacing.medium,
    marginHorizontal: spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'stretch',
    minWidth: '80%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Fredoka',
    fontSize: fontSize.xxxlarge,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: '#E6F0FF',
    color: '#222',
    borderRadius: borderRadius.small,
    padding: spacing.medium,
    fontSize: fontSize.medium,
    minHeight: 100,
    marginBottom: spacing.medium,
    fontFamily: 'Poppins',
  },
  arrowBtn: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    padding: spacing.medium,
    alignItems: 'center',
    marginTop: spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowBtnDisabled: {
    opacity: 0.4,
  },
  arrowBtnText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#222',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
    backgroundColor: '#fff',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  label: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.large,
    color: '#111',
    marginRight: spacing.small,
  },
  nameCard: {
    backgroundColor: '#cceeff',
    borderRadius: borderRadius.small,
    padding: spacing.small,
    marginBottom: spacing.small,
  },
  nameInput: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.small,
    padding: spacing.small,
    fontSize: fontSize.medium,
    fontFamily: 'Poppins',
    marginTop: spacing.small,
  },
  characterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9D6',
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  characterRowWhite: { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 10 },
  characterName: {
    fontFamily: 'Fredoka',
    fontSize: fontSize.large,
    color: '#222',
    marginRight: spacing.medium,
    flexShrink: 0,
  },
  characterPickerWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  characterPickerCard: {
    backgroundColor: '#E6F0FF',
    borderRadius: borderRadius.small,
    flex: 1,
    marginHorizontal: spacing.small,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.small,
    justifyContent: 'center',
    minWidth: 120,
    maxWidth: 180,
  },
  helperText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#888',
    marginTop: spacing.small,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  dialogueContainer: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginVertical: spacing.medium,
    maxHeight: 400,
  },
  dialogueText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    lineHeight: 24,
    color: '#222',
  },
  backBtn: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    padding: spacing.medium,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  backBtnText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
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
  loadingText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#222',
    marginTop: spacing.small,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffebee',
    borderRadius: borderRadius.round,
    padding: spacing.medium,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.small,
    padding: spacing.small,
    fontSize: fontSize.medium,
    fontFamily: 'Poppins',
  },
  generateBtn: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    padding: spacing.medium,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  generateBtnText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#222',
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
});

export default DialogueGen; 