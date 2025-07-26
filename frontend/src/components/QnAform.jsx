
import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Button, MenuItem, TextField, Select, InputLabel, FormControl, Divider, Avatar, Stack, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Person, MonetizationOn, TrendingUp, Flag, HelpOutline } from '@mui/icons-material';
import { saveUserData, fetchUserData } from "../services/firestoreService";
const dashboardTools = [
  "fetch_net_worth",
  "fetch_bank_transactions",
  "fetch_credit_report",
  "fetch_epf_details",
  "fetch_mf_transactions",
  "fetch_stock_transactions"
];
import { auth } from "../firebase";

const riskOptions = [
  "10%",
  "20%",
  "30%",
  "40%",
  "50%",
  "60%",
  "70%",
  "80%",
  "90%",
  "100%",
  "Other"
];
const goalOptions = ["Savings", "Debt Repayment", "Investment", "Travel", "Emergency Fund", "Other"];
const reasonOptions = ["Track my spending", "Save for goals", "Improve financial habits", "Plan investments", "Learn about finance", "Other"];

const QnAForm = () => {
  const theme = useTheme();
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    monthlyIncome: "",
    monthlyBudget: "",
    riskTolerance: riskOptions[0],
    riskToleranceOther: "",
    monthlyGoal: "",
    financialGoals: [
      { type: goalOptions[0], other: "", details: "" }
    ],
    usageReason: reasonOptions[0],
    usageReasonOther: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [savedData, setSavedData] = useState(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Reset 'Other' field if not 'Other'
    if (name === "riskTolerance" && value !== "Other") setForm((prev) => ({ ...prev, riskToleranceOther: "" }));
    if (name === "usageReason" && value !== "Other") setForm((prev) => ({ ...prev, usageReasonOther: "" }));
  };

  // For financial goals array
  const handleGoalChange = (idx, field, value) => {
    setForm((prev) => {
      const goals = prev.financialGoals.map((g, i) =>
        i === idx ? { ...g, [field]: value, ...(field === 'type' && value !== 'Other' ? { other: "" } : {}) } : g
      );
      return { ...prev, financialGoals: goals };
    });
  };

  const addGoal = () => {
    setForm((prev) => ({
      ...prev,
      financialGoals: [...prev.financialGoals, { type: goalOptions[0], other: "", details: "" }]
    }));
  };

  const removeGoal = (idx) => {
    setForm((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.filter((_, i) => i !== idx)
    }));
  };

  const handleOtherChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setSubmitting(false);
      return alert("User not logged in");
    }
    // Compose answers, using 'Other' if selected, and map all goals
    const dataToSave = {
      ...form,
      riskTolerance: form.riskTolerance === "Other" ? form.riskToleranceOther : form.riskTolerance,
      financialGoals: form.financialGoals.map(g => ({
        type: g.type === "Other" ? g.other : g.type,
        details: g.details
      })),
      usageReason: form.usageReason === "Other" ? form.usageReasonOther : form.usageReason,
      createdAt: new Date(),
    };
    await saveUserData(userId, dataToSave);
    setSubmitting(false);
    alert("Your responses are saved!");
    // Fetch and show saved data
    const fetched = await fetchUserData(userId);
    setSavedData(fetched);

  };

  // On mount, fetch saved data if exists
  useEffect(() => {
    const fetchData = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const fetched = await fetchUserData(userId);
        if (fetched) setSavedData(fetched);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.background.default }}>
      <Card sx={{ maxWidth: 520, width: '100%', borderRadius: 4, boxShadow: 8, p: { xs: 1, sm: 3 }, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, overflowY: 'auto', maxHeight: '75vh', pr: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <HelpOutline />
            </Avatar>
            <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              Onboarding Questionnaire
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Person color="primary" />
              <TextField
                name="fullName"
                label="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
                fullWidth
                helperText="Enter your complete name"
              />
              <TextField
                name="age"
                label="Age"
                type="number"
                value={form.age}
                onChange={handleChange}
                required
                sx={{ maxWidth: 120 }}
                helperText="Years"
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <MonetizationOn color="primary" />
              <TextField
                name="monthlyIncome"
                label="Monthly Income (₹)"
                type="number"
                value={form.monthlyIncome}
                onChange={handleChange}
                required
                fullWidth
                helperText="Your average monthly income"
              />
              <TextField
                name="monthlyBudget"
                label="Monthly Budget (₹)"
                type="number"
                value={form.monthlyBudget}
                onChange={handleChange}
                required
                sx={{ maxWidth: 180 }}
                helperText="How much do you budget?"
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <TrendingUp color="primary" />
              <TextField
                name="monthlyGoal"
                label="Monthly Goal (₹)"
                type="number"
                value={form.monthlyGoal}
                onChange={handleChange}
                required
                fullWidth
                helperText="How much do you want to save/invest monthly?"
              />
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="What % of your portfolio are you willing to risk?">
                <Flag color="primary" />
              </Tooltip>
              <FormControl fullWidth required>
                <InputLabel>Risk Tolerance (%)</InputLabel>
                <Select
                  name="riskTolerance"
                  value={form.riskTolerance}
                  label="Risk Tolerance (%)"
                  onChange={handleChange}
                >
                  {riskOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {form.riskTolerance === "Other" && (
                <TextField
                  name="riskToleranceOther"
                  label="Specify % or description"
                  value={form.riskToleranceOther}
                  onChange={handleOtherChange}
                  required
                  sx={{ minWidth: 120 }}
                />
              )}
            </Stack>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Financial Goals
              </Typography>
              {form.financialGoals.map((goal, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, background: theme.palette.background.paper }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                    <FormControl fullWidth required sx={{ minWidth: 160 }}>
                      <InputLabel>Goal Type</InputLabel>
                      <Select
                        value={goal.type}
                        label="Goal Type"
                        onChange={e => handleGoalChange(idx, 'type', e.target.value)}
                      >
                        {goalOptions.map(opt => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {goal.type === "Other" && (
                      <TextField
                        label="Specify goal"
                        value={goal.other}
                        onChange={e => handleGoalChange(idx, 'other', e.target.value)}
                        required
                        sx={{ minWidth: 160 }}
                      />
                    )}
                    <TextField
                      label="Elaborate (specifications, details, etc.)"
                      value={goal.details}
                      onChange={e => handleGoalChange(idx, 'details', e.target.value)}
                      required
                      fullWidth
                      multiline
                      minRows={2}
                      helperText="Please specify your goal in detail"
                    />
                    {form.financialGoals.length > 1 && (
                      <Button color="error" variant="outlined" onClick={() => removeGoal(idx)} sx={{ alignSelf: 'center', minWidth: 40, px: 1 }}>
                        Remove
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
              <Button variant="outlined" color="primary" onClick={addGoal} sx={{ mt: 1, fontWeight: 500 }}>
                + Add one more goal
              </Button>
            </Box>
            <FormControl fullWidth required>
              <InputLabel>Why are you using Financial Friend?</InputLabel>
              <Select
                name="usageReason"
                value={form.usageReason}
                label="Why are you using Financial Friend?"
                onChange={handleChange}
              >
                {reasonOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.usageReason === "Other" && (
              <TextField
                name="usageReasonOther"
                label="Please specify your reason"
                value={form.usageReasonOther}
                onChange={handleOtherChange}
                required
                fullWidth
              />
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              sx={{ mt: 2, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem', py: 1.2 }}
            >
              {submitting ? "Saving..." : "Save & Continue"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Show saved data if available */}
      {savedData && (
        <Card sx={{ mt: 4, maxWidth: 520, mx: 'auto', borderRadius: 3, boxShadow: 4, background: theme.palette.background.paper }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700, mb: 2 }}>
              Your Saved QnA Data
            </Typography>
            <Box sx={{ mb: 1 }}>
              <b>Name:</b> {savedData.fullName}<br />
              <b>Age:</b> {savedData.age}<br />
              <b>Monthly Income:</b> ₹{savedData.monthlyIncome}<br />
              <b>Monthly Budget:</b> ₹{savedData.monthlyBudget}<br />
              <b>Monthly Goal:</b> ₹{savedData.monthlyGoal}<br />
              <b>Risk Tolerance:</b> {savedData.riskTolerance}
            </Box>
            <Box sx={{ mb: 1 }}>
              <b>Financial Goals:</b>
              <ul style={{ marginTop: 4 }}>
                {Array.isArray(savedData.financialGoals) && savedData.financialGoals.map((g, i) => (
                  <li key={i}><b>{g.type}</b>: {g.details}</li>
                ))}
              </ul>
            </Box>
            <Box>
              <b>Reason for using Financial Friend:</b> {savedData.usageReason}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default QnAForm;
