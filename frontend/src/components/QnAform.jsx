
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
import { useLocation } from "react-router-dom";

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
  const [editMode, setEditMode] = useState(false);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const phone = urlParams.get("phone");


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
    if (!phone) {
      setSubmitting(false);
      return alert("No phone number found in URL");
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
    await saveUserData(phone, dataToSave);
    setSubmitting(false);
    alert("Your responses are saved!");
    // Fetch and show saved data
    const fetched = await fetchUserData(phone);
    setSavedData(fetched);
  };

  // On mount, fetch saved data if exists
  useEffect(() => {
    const fetchData = async () => {
      if (phone) {
        const fetched = await fetchUserData(phone);
        if (fetched) {
          setSavedData(fetched);
          setForm({
            fullName: fetched.fullName || "",
            age: fetched.age || "",
            monthlyIncome: fetched.monthlyIncome || "",
            monthlyBudget: fetched.monthlyBudget || "",
            riskTolerance: riskOptions.includes(fetched.riskTolerance) ? fetched.riskTolerance : "Other",
            riskToleranceOther: riskOptions.includes(fetched.riskTolerance) ? "" : fetched.riskTolerance || "",
            monthlyGoal: fetched.monthlyGoal || "",
            financialGoals: Array.isArray(fetched.financialGoals) && fetched.financialGoals.length > 0 ? fetched.financialGoals.map(g => ({
              type: goalOptions.includes(g.type) ? g.type : "Other",
              other: goalOptions.includes(g.type) ? "" : g.type,
              details: g.details || ""
            })) : [{ type: goalOptions[0], other: "", details: "" }],
            usageReason: reasonOptions.includes(fetched.usageReason) ? fetched.usageReason : "Other",
            usageReasonOther: reasonOptions.includes(fetched.usageReason) ? "" : fetched.usageReason || "",
          });
        }
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [phone]);

  // If savedData exists, show only the beautiful card UI with goals showcase
  if (savedData && !editMode) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.background.default }}>
        <Card sx={{ maxWidth: 600, width: '100%', borderRadius: 5, boxShadow: 12, p: { xs: 2, sm: 4 }, maxHeight: '90vh', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 20 } }}>
          <CardContent sx={{ flex: 1, overflowY: 'auto', maxHeight: '75vh', pr: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56, fontSize: 32 }}>
                <Person fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 800, letterSpacing: 1 }}>
                Welcome, {savedData.fullName}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 2 }}>
              <Card sx={{ flex: 1, p: 2, borderRadius: 3, boxShadow: 4, background: theme.palette.background.paper, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Profile</Typography>
                <Typography><b>Age:</b> {savedData.age}</Typography>
                <Typography><b>Monthly Income:</b> ₹{savedData.monthlyIncome}</Typography>
                <Typography><b>Monthly Budget:</b> ₹{savedData.monthlyBudget}</Typography>
                <Typography><b>Monthly Goal:</b> ₹{savedData.monthlyGoal}</Typography>
                <Typography><b>Risk Tolerance:</b> {savedData.riskTolerance}</Typography>
                <Typography><b>Reason:</b> {savedData.usageReason}</Typography>
              </Card>
              <Card sx={{ flex: 2, p: 2, borderRadius: 3, boxShadow: 4, background: 'linear-gradient(135deg, #20d4aa 0%, #1890ff 100%)', color: '#fff', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 12 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>🎯 Financial Goals</Typography>
                <Stack spacing={1}>
                  {Array.isArray(savedData.financialGoals) && savedData.financialGoals.map((g, i) => (
                    <Card key={i} sx={{ p: 2, borderRadius: 2, boxShadow: 2, background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: '1.1rem', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6, background: 'rgba(32,212,170,0.18)' } }}>
                      <b>{g.type}</b>: {g.details}
                    </Card>
                  ))}
                </Stack>
              </Card>
            </Stack>
            <Button variant="outlined" color="primary" sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }} onClick={() => setEditMode(true)}>
              Edit Info
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Show the questionnaire form if no saved data or if in edit mode
  if (!savedData || editMode) {
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
            <Box component="form" onSubmit={async (e) => {
              await handleSubmit(e);
              setEditMode(false);
            }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            {editMode && (
              <Button variant="outlined" color="secondary" sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }} onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }
};

export default QnAForm;
