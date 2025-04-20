import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

const xorBits = (a, b) => {
  return a.split('').map((bit, i) => (bit === b[i] ? '0' : '1')).join('');
};

const Fk = (key, inputBits) => {
  return xorBits(key, inputBits);
};

const macWithSteps = (key, message) => {
  const n = key.length;
  if (message.length !== 2 * (n - 1)) {
    return { error: `Message length must be exactly ${2 * (n - 1)} bits.` };
  }
  const m0 = message.slice(0, n - 1);
  const m1 = message.slice(n - 1);
  const input0 = '0' + m0;
  const input1 = '1' + m1;
  const t0 = Fk(key, input0);
  const t1 = Fk(key, input1);
  const tag = t0 + t1;
  return {
    tag,
    steps: { m0, m1, input0, input1, t0, t1 }
  };
};

const vrfy = (key, message, tag) => {
  const result = macWithSteps(key, message);
  if (typeof result === 'object' && result.error) return false;
  return result.tag === tag;
};

const App = () => {
  const [key, setKey] = useState('1010');
  const [message, setMessage] = useState('010111');
  const [tag, setTag] = useState('');
  const [verificationResult, setVerificationResult] = useState('');
  const [attackResult, setAttackResult] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [macSteps, setMacSteps] = useState(null); // New state for MAC steps

  const handleGenerateMac = () => {
    const result = macWithSteps(key, message);
    if (result.error) {
      setTag('');
      setVerificationResult(result.error);
      setMacSteps(null);
    } else {
      setTag(result.tag);
      setVerificationResult('');
      setMacSteps({
        m0: result.steps.m0,
        m1: result.steps.m1,
        input0: result.steps.input0,
        input1: result.steps.input1,
        t0: result.steps.t0,
        t1: result.steps.t1
      });
    }
  };

  const handleVerifyMac = () => {
    const valid = vrfy(key, message, tag);
    setVerificationResult(valid ? 'MAC Verification SUCCESS' : 'MAC Verification FAILURE');
  };

  const demonstrateAttack = () => {
    const keyDemo = '1010';
    const msg1 = '010111';
    const msg2 = '101001';
    const n = keyDemo.length;

    const mac1 = macWithSteps(keyDemo, msg1);
    const mac2 = macWithSteps(keyDemo, msg2);

    const forgedMsg = msg1.slice(0, n - 1) + msg2.slice(n - 1);
    const forgedTag = mac1.tag.slice(0, n) + mac2.tag.slice(n);

    const success = vrfy(keyDemo, forgedMsg, forgedTag);

    setAttackResult({
      key: keyDemo,
      mac1,
      mac2,
      forgedMsg,
      forgedTag,
      success
    });
  };

  const runTests = () => {
    const results = [];

    const key = '1010';
    const message = '010111';
    const correctMac = macWithSteps(key, message).tag;

    results.push({
      name: 'Basic Verification',
      description: 'Generate a MAC and verify it correctly.',
      pass: vrfy(key, message, correctMac)
    });

    results.push({
      name: 'Wrong Tag Verification',
      description: 'Modify the tag and check that verification fails.',
      pass: !vrfy(key, message, '00000000')
    });

    const msg1 = '010111';
    const msg2 = '101001';
    const mac1 = macWithSteps(key, msg1);
    const mac2 = macWithSteps(key, msg2);
    const forgedMsg = msg1.slice(0, 3) + msg2.slice(3);
    const forgedTag = mac1.tag.slice(0, 4) + mac2.tag.slice(4);
    results.push({
      name: 'Attack Forgery Verification',
      description: 'Forge a new valid message using two legitimate message-tag pairs.',
      pass: vrfy(key, forgedMsg, forgedTag)
    });

    const flippedMessage = '110111';
    results.push({
      name: 'Random Bit Flip Verification',
      description: 'Flip one bit in the message and check that verification fails.',
      pass: !vrfy(key, flippedMessage, correctMac)
    });

    const badMessage = '10101';
    const badMac = macWithSteps(key, badMessage);
    results.push({
      name: 'Invalid Length Message',
      description: 'Provide a wrong length message and check error handling.',
      pass: badMac.error !== undefined
    });

    setTestResults(results);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          MAC Scheme Demo
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generate / Verify MAC
          </Typography>
          <TextField
            fullWidth
            label="Key (binary, e.g., 1010)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Message (binary, e.g., 010111)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleGenerateMac}>
              Generate MAC
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleVerifyMac}>
              Verify MAC
            </Button>
          </Box>

          {tag && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <strong>Generated Tag:</strong> {tag}
            </Alert>
          )}

          {macSteps && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="subtitle2">MAC Generation Process:</Typography>
              <Typography variant="body2">Split Message into:</Typography>
              <Typography variant="body2">- m0: {macSteps.m0}</Typography>
              <Typography variant="body2">- m1: {macSteps.m1}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Prefix Bits:</Typography>
              <Typography variant="body2">- 0 || m0 = {macSteps.input0}</Typography>
              <Typography variant="body2">- 1 || m1 = {macSteps.input1}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Apply PRF (Fk):</Typography>
              <Typography variant="body2">- Fk(0||m0) = {macSteps.t0}</Typography>
              <Typography variant="body2">- Fk(1||m1) = {macSteps.t1}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Final Tag:</strong> {macSteps.t0 + macSteps.t1}</Typography>
            </Alert>
          )}

          {verificationResult && (
            <Alert severity={verificationResult.includes('SUCCESS') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {verificationResult}
            </Alert>
          )}
        </Box>

        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Attack Demo
          </Typography>
          <Button variant="contained" color="error" onClick={demonstrateAttack}>
            Demonstrate Forgery Attack
          </Button>

          {attackResult && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Step-by-Step Attack Explanation
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Original Message 1:</strong> {attackResult.mac1.steps.m0 + attackResult.mac1.steps.m1}<br/>
                Split into: m0 = {attackResult.mac1.steps.m0}, m1 = {attackResult.mac1.steps.m1}<br/>
                Compute:<br/>
                Fk(0 || m0) = Fk({attackResult.mac1.steps.input0}) = {attackResult.mac1.steps.t0}<br/>
                Fk(1 || m1) = Fk({attackResult.mac1.steps.input1}) = {attackResult.mac1.steps.t1}<br/>
                Tag1 = {attackResult.mac1.steps.t0} || {attackResult.mac1.steps.t1} = {attackResult.mac1.tag}
              </Alert>

              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Original Message 2:</strong> {attackResult.mac2.steps.m0 + attackResult.mac2.steps.m1}<br/>
                Split into: m0 = {attackResult.mac2.steps.m0}, m1 = {attackResult.mac2.steps.m1}<br/>
                Compute:<br/>
                Fk(0 || m0) = Fk({attackResult.mac2.steps.input0}) = {attackResult.mac2.steps.t0}<br/>
                Fk(1 || m1) = Fk({attackResult.mac2.steps.input1}) = {attackResult.mac2.steps.t1}<br/>
                Tag2 = {attackResult.mac2.steps.t0} || {attackResult.mac2.steps.t1} = {attackResult.mac2.tag}
              </Alert>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Forged Message:</strong> {attackResult.forgedMsg}<br/>
                <strong>Forged Tag:</strong> {attackResult.forgedTag}
              </Alert>

              <Alert severity={attackResult.success ? 'success' : 'error'}>
                <strong>Verification Result:</strong> {attackResult.success ? 'Forgery Verified Successfully!' : 'Forgery Failed.'}
              </Alert>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Test Cases
          </Typography>
          <Button variant="contained" color="success" onClick={runTests}>
            Run Test Cases
          </Button>

          {testResults.length > 0 && (
            <Box sx={{ mt: 4 }}>
              {testResults.map((test, idx) => (
                <Alert key={idx} severity={test.pass ? 'success' : 'error'} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1"><strong>{test.name}</strong></Typography>
                  <Typography variant="body2">{test.description}</Typography>
                  Result: {test.pass ? 'Passed' : 'Failed'}
                </Alert>
              ))}
            </Box>
          )}
        </Box>

      </Paper>
    </Container>
  );
};

export default App;
