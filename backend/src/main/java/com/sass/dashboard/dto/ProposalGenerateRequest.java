package com.sass.dashboard.dto;

public class ProposalGenerateRequest {
    private String mode;
    private String projectName;
    private String clientName;
    private String businessGoal;
    private String features;
    private String timeline;
    private String pricingModel;
    private String budget;
    private String purposeNotes;
    private String apiKey;
    private String model;

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getBusinessGoal() {
        return businessGoal;
    }

    public void setBusinessGoal(String businessGoal) {
        this.businessGoal = businessGoal;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public String getTimeline() {
        return timeline;
    }

    public void setTimeline(String timeline) {
        this.timeline = timeline;
    }

    public String getPricingModel() {
        return pricingModel;
    }

    public void setPricingModel(String pricingModel) {
        this.pricingModel = pricingModel;
    }

    public String getBudget() {
        return budget;
    }

    public void setBudget(String budget) {
        this.budget = budget;
    }

    public String getPurposeNotes() {
        return purposeNotes;
    }

    public void setPurposeNotes(String purposeNotes) {
        this.purposeNotes = purposeNotes;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
