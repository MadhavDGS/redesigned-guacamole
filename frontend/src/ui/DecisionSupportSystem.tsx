import React, { useState, useEffect, useCallback } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  HandRaisedIcon,
  GlobeAsiaAustraliaIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface GovernmentScheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  eligibility: string[];
  benefits: string;
  applicableAreas: string[];
  priority: 'high' | 'medium' | 'low';
  matchScore?: number;
}

interface FRAClaimAnalysis {
  claimId: string;
  claimType: string;
  location: {
    state: string;
    district: string;
    village: string;
  };
  applicant: {
    name: string;
    category: string;
    landholding: number;
  };
  assets: {
    forestArea: number;
    agriculturalLand: number;
    waterBodies: number;
  };
  currentStatus: string;
  riskFactors: string[];
  eligibleSchemes: GovernmentScheme[];
  priorityScore: number;
  recommendations: Recommendation[];
}

interface Recommendation {
  id: string;
  type: 'scheme_match' | 'risk_mitigation' | 'policy_intervention' | 'conflict_resolution';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionItems: string[];
  timeline: string;
  estimatedBenefit: string;
}

interface ConflictDetection {
  id: string;
  type: 'overlapping_claims' | 'protected_area' | 'mining_conflict' | 'development_project';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedClaims: string[];
  resolutionStrategy: string;
  stakeholders: string[];
}

const DecisionSupportSystem: React.FC = () => {
  // State management
  const [selectedClaim, setSelectedClaim] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<FRAClaimAnalysis | null>(null);
  const [availableSchemes, setAvailableSchemes] = useState<GovernmentScheme[]>([]);
  const [conflictDetections, setConflictDetections] = useState<ConflictDetection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [filterCriteria, setFilterCriteria] = useState({
    priority: 'all',
    ministry: 'all',
    claimType: 'all'
  });

  // Government schemes database
  const governmentSchemes: GovernmentScheme[] = [
    {
      id: 'pmkisan',
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      description: 'Income support scheme providing ₹6,000 per year to farmer families',
      eligibility: [
        'Small and marginal farmer families',
        'Landholding up to 2 hectares',
        'Valid Aadhaar card',
        'Bank account details'
      ],
      benefits: 'Direct cash transfer of ₹6,000/year in 3 installments',
      applicableAreas: ['Agricultural Land', 'Mixed Use Areas'],
      priority: 'high'
    },
    {
      id: 'jaljeevan',
      name: 'Jal Jeevan Mission',
      ministry: 'Ministry of Jal Shakti',
      description: 'Providing functional household tap connection to every rural household',
      eligibility: [
        'Rural households',
        'Community participation',
        'Gram Panchayat resolution',
        'Water source availability'
      ],
      benefits: 'Piped water supply connection with quality assurance',
      applicableAreas: ['Villages', 'Rural Settlements', 'Tribal Areas'],
      priority: 'high'
    },
    {
      id: 'mgnrega',
      name: 'MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)',
      ministry: 'Ministry of Rural Development',
      description: 'Guaranteed 100 days of employment to rural households',
      eligibility: [
        'Rural households',
        'Adult family members',
        'Job card registration',
        'Demand for work'
      ],
      benefits: 'Guaranteed wage employment for 100 days per household per year',
      applicableAreas: ['Rural Areas', 'Forest Areas', 'Tribal Regions'],
      priority: 'high'
    },
    {
      id: 'pmawas',
      name: 'PM Awas Yojana - Gramin',
      ministry: 'Ministry of Rural Development',
      description: 'Housing for all in rural areas by 2024',
      eligibility: [
        'Homeless families',
        'Families living in 0, 1, or 2 room houses',
        'Below Poverty Line',
        'No pucca house ownership'
      ],
      benefits: 'Financial assistance up to ₹1.30 lakh for house construction',
      applicableAreas: ['Rural Areas', 'Tribal Settlements'],
      priority: 'medium'
    },
    {
      id: 'campa',
      name: 'CAMPA (Compensatory Afforestation Fund)',
      ministry: 'Ministry of Environment, Forest and Climate Change',
      description: 'Compensatory afforestation and forest regeneration',
      eligibility: [
        'Forest land diversion projects',
        'Compensatory afforestation requirement',
        'Environmental clearance',
        'State forest department approval'
      ],
      benefits: 'Funding for afforestation and forest development activities',
      applicableAreas: ['Forest Areas', 'Degraded Forests', 'Protected Areas'],
      priority: 'medium'
    },
    {
      id: 'svamitva',
      name: 'SVAMITVA (Survey of Villages and Mapping)',
      ministry: 'Ministry of Panchayati Raj',
      description: 'Property rights to village household owners',
      eligibility: [
        'Rural household owners',
        'Inhabited areas in villages',
        'Non-forest areas',
        'Clear ownership evidence'
      ],
      benefits: 'Property cards for rural households with clear titles',
      applicableAreas: ['Village Settlements', 'Rural Residential Areas'],
      priority: 'low'
    }
  ];

  // Mock FRA claims for analysis
  const mockClaims = [
    {
      id: 'FRA_MP_2024_001',
      name: 'Individual Forest Rights - Ramesh Baiga',
      location: 'Khairwani, Dindori, Madhya Pradesh',
      type: 'Individual Forest Rights (IFR)',
      status: 'Under Review'
    },
    {
      id: 'FRA_CG_2024_002', 
      name: 'Community Rights - Baiga Community',
      location: 'Lalbarra, Kawardha, Chhattisgarh',
      type: 'Community Forest Rights (CFR)',
      status: 'Pending'
    },
    {
      id: 'FRA_MH_2024_003',
      name: 'Community Rights - Gond Settlement',
      location: 'Bhamragad, Gadchiroli, Maharashtra', 
      type: 'Community Rights (CR)',
      status: 'Approved'
    }
  ];

  // Scheme matching algorithm
  const analyzeClaimForSchemes = useCallback((claimId: string): FRAClaimAnalysis => {
    // Mock analysis - In real implementation, this would use ML algorithms
    const mockAnalysis: FRAClaimAnalysis = {
      claimId: claimId,
      claimType: 'Individual Forest Rights',
      location: {
        state: 'Madhya Pradesh',
        district: 'Dindori',
        village: 'Khairwani'
      },
      applicant: {
        name: 'Ramesh Kumar Baiga',
        category: 'Scheduled Tribe',
        landholding: 2.3
      },
      assets: {
        forestArea: 1.8,
        agriculturalLand: 0.5,
        waterBodies: 0.0
      },
      currentStatus: 'Under Review',
      riskFactors: [
        'Overlapping mining lease application',
        'Insufficient documentary evidence',
        'Boundary disputes with neighboring village'
      ],
      eligibleSchemes: [],
      priorityScore: 0,
      recommendations: []
    };

    // Calculate scheme matches
    const eligibleSchemes = governmentSchemes.map(scheme => {
      let matchScore = 0;
      
      // Location-based matching
      if (scheme.applicableAreas.some(area => 
        area.toLowerCase().includes('rural') || 
        area.toLowerCase().includes('tribal') ||
        area.toLowerCase().includes('forest')
      )) {
        matchScore += 30;
      }
      
      // Category-based matching
      if (mockAnalysis.applicant.category === 'Scheduled Tribe') {
        matchScore += 25;
      }
      
      // Land size matching
      if (scheme.id === 'pmkisan' && mockAnalysis.applicant.landholding <= 2) {
        matchScore += 40;
      }
      
      // Forest area matching
      if (mockAnalysis.assets.forestArea > 0) {
        if (scheme.id === 'campa') matchScore += 35;
        if (scheme.id === 'mgnrega') matchScore += 25;
      }
      
      // Priority adjustments
      if (scheme.priority === 'high') matchScore += 5;
      
      return { ...scheme, matchScore };
    }).filter(scheme => scheme.matchScore > 50)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    mockAnalysis.eligibleSchemes = eligibleSchemes;

    // Generate recommendations
    const recommendations: Recommendation[] = [
      {
        id: 'rec_001',
        type: 'scheme_match',
        title: 'Apply for PM-KISAN Scheme',
        description: 'High compatibility (87% match) with PM-KISAN eligibility criteria',
        impact: 'high',
        confidence: 87,
        actionItems: [
          'Verify Aadhaar linkage with bank account',
          'Submit land ownership documents',
          'Register on PM-KISAN portal',
          'Complete biometric authentication'
        ],
        timeline: '2-4 weeks for processing',
        estimatedBenefit: '₹6,000 annual income support'
      },
      {
        id: 'rec_002',
        type: 'risk_mitigation',
        title: 'Address Mining Lease Conflict',
        description: 'Potential overlap with mining lease application requires immediate attention',
        impact: 'high',
        confidence: 92,
        actionItems: [
          'File objection with District Collector',
          'Submit evidence of traditional occupation',
          'Engage legal support for conflict resolution',
          'Coordinate with environmental groups'
        ],
        timeline: '6-12 months for resolution',
        estimatedBenefit: 'Secure forest rights protection'
      },
      {
        id: 'rec_003',
        type: 'policy_intervention',
        title: 'Strengthen Documentary Evidence',
        description: 'Improve claim documentation through SVAMITVA scheme integration',
        impact: 'medium',
        confidence: 74,
        actionItems: [
          'Participate in village mapping exercise',
          'Collect elder testimonies',
          'Document traditional practices',
          'Create photographic evidence timeline'
        ],
        timeline: '3-6 months',
        estimatedBenefit: 'Increased approval probability by 40%'
      }
    ];

    mockAnalysis.recommendations = recommendations;
    mockAnalysis.priorityScore = eligibleSchemes.reduce((sum, scheme) => sum + (scheme.matchScore || 0), 0) / eligibleSchemes.length;

    return mockAnalysis;
  }, []);

  // Conflict detection algorithm
  const detectConflicts = useCallback((claimId: string): ConflictDetection[] => {
    return [
      {
        id: 'conflict_001',
        type: 'mining_conflict',
        severity: 'critical',
        description: 'Coal mining lease application overlaps with claimed forest area',
        affectedClaims: [claimId, 'FRA_MP_2024_007', 'FRA_MP_2024_012'],
        resolutionStrategy: 'Environmental impact assessment review and community consultation',
        stakeholders: ['District Collector', 'Forest Department', 'Mining Company', 'Tribal Community']
      },
      {
        id: 'conflict_002',
        type: 'overlapping_claims',
        severity: 'medium',
        description: 'Boundary overlap with neighboring village community claim',
        affectedClaims: [claimId, 'FRA_MP_2024_089'],
        resolutionStrategy: 'Joint boundary verification and negotiated settlement',
        stakeholders: ['Village Committees', 'Revenue Department', 'Survey Settlement Officer']
      }
    ];
  }, []);

  // Perform comprehensive analysis
  const performAnalysis = async () => {
    if (!selectedClaim) {
      alert('Please select a claim to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAvailableSchemes(governmentSchemes);

    try {
      const steps = [
        'Loading claim data...',
        'Analyzing eligibility criteria...',
        'Matching government schemes...',
        'Calculating priority scores...',
        'Detecting potential conflicts...',
        'Generating recommendations...',
        'Finalizing analysis...'
      ];

      for (let i = 0; i < steps.length; i++) {
        console.log(`Analysis step ${i + 1}: ${steps[i]}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(((i + 1) / steps.length) * 100);
      }

      const analysis = analyzeClaimForSchemes(selectedClaim);
      const conflicts = detectConflicts(selectedClaim);
      
      setAnalysisResults(analysis);
      setConflictDetections(conflicts);
      
      console.log('✅ Decision support analysis completed');
      
    } catch (error) {
      console.error('Analysis error:', error);
      alert('❌ Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Component styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          fontSize: '28px', 
          fontWeight: '700', 
          margin: '0 0 8px 0' 
        }}>
          <CpuChipIcon style={{ width: '32px', height: '32px' }} />
          AI-Powered Decision Support System
        </h1>
        <p style={{ 
          fontSize: '16px', 
          opacity: 0.9, 
          margin: '0 0 16px 0' 
        }}>
          Intelligent scheme matching, conflict detection, and policy recommendation engine
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap' 
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <BanknotesIcon style={{ width: '16px', height: '16px' }} />
            Government Scheme Matching
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
            Conflict Detection
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <LightBulbIcon style={{ width: '16px', height: '16px' }} />
            Smart Recommendations
          </span>
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Claim Selection */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            <DocumentTextIcon style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            Select FRA Claim
          </h3>
          <select
            value={selectedClaim}
            onChange={(e) => setSelectedClaim(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '12px'
            }}
          >
            <option value="">Choose a claim for analysis</option>
            {mockClaims.map(claim => (
              <option key={claim.id} value={claim.id}>
                {claim.name} - {claim.location}
              </option>
            ))}
          </select>
          
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Select a FRA claim to analyze scheme eligibility and generate recommendations
          </div>
        </div>

        {/* Analysis Controls */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            <CpuChipIcon style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
            Analysis Engine
          </h3>
          
          <button
            onClick={performAnalysis}
            disabled={isAnalyzing || !selectedClaim}
            style={{
              width: '100%',
              padding: '12px',
              background: isAnalyzing || !selectedClaim ? '#9ca3af' : '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isAnalyzing || !selectedClaim ? 'not-allowed' : 'pointer',
              marginBottom: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {isAnalyzing ? `🔄 Analyzing... ${Math.round(analysisProgress)}%` : '🚀 Start AI Analysis'}
          </button>
          
          {isAnalyzing && (
            <div style={{
              width: '100%',
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                width: `${analysisProgress}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            <AdjustmentsHorizontalIcon style={{ width: '20px', height: '20px', color: '#10b981' }} />
            Analysis Filters
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select
              value={filterCriteria.priority}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, priority: e.target.value }))}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            
            <select
              value={filterCriteria.ministry}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, ministry: e.target.value }))}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="all">All Ministries</option>
              <option value="agriculture">Agriculture & Farmers Welfare</option>
              <option value="rural">Rural Development</option>
              <option value="environment">Environment & Forests</option>
              <option value="jalshakti">Jal Shakti</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showRecommendations ? '2fr 1fr' : '1fr',
          gap: '20px'
        }}>
          {/* Main Results Panel */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3>📊 Analysis Results: {analysisResults.claimId}</h3>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {showRecommendations ? 'Hide' : 'Show'} Recommendations
              </button>
            </div>

            {/* Claim Overview */}
            <div style={{
              background: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                Claim Overview
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Applicant:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{analysisResults.applicant.name}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Category:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{analysisResults.applicant.category}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Location:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {analysisResults.location.village}, {analysisResults.location.district}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Land Holding:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{analysisResults.applicant.landholding} ha</span>
                </div>
              </div>
            </div>

            {/* Eligible Schemes */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                🎯 Eligible Government Schemes ({analysisResults.eligibleSchemes.length})
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '12px'
              }}>
                {analysisResults.eligibleSchemes.map(scheme => (
                  <div key={scheme.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: selectedScheme?.id === scheme.id ? '#eff6ff' : 'white'
                  }} onClick={() => setSelectedScheme(scheme)}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{scheme.name}</h5>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: '#dcfce7',
                        color: '#166534'
                      }}>
                        {scheme.matchScore}% match
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                      {scheme.description}
                    </p>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {scheme.ministry}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            {analysisResults.riskFactors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#dc2626' }}>
                  ⚠️ Risk Factors Detected
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysisResults.riskFactors.map((risk, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#991b1b'
                    }}>
                      <ExclamationTriangleIcon style={{ 
                        width: '16px', 
                        height: '16px', 
                        display: 'inline-block', 
                        marginRight: '8px' 
                      }} />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict Detection */}
            {conflictDetections.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#dc2626' }}>
                  🚨 Conflict Detection Results
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {conflictDetections.map(conflict => (
                    <div key={conflict.id} style={{
                      border: `2px solid ${conflict.severity === 'critical' ? '#dc2626' : 
                                           conflict.severity === 'high' ? '#f59e0b' : '#10b981'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      background: conflict.severity === 'critical' ? '#fef2f2' : 
                                 conflict.severity === 'high' ? '#fffbeb' : '#f0fdf4'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                          {conflict.type.replace(/_/g, ' ').toUpperCase()}
                        </h5>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background: conflict.severity === 'critical' ? '#fee2e2' : 
                                     conflict.severity === 'high' ? '#fef3c7' : '#dcfce7',
                          color: conflict.severity === 'critical' ? '#991b1b' : 
                                 conflict.severity === 'high' ? '#92400e' : '#166534'
                        }}>
                          {conflict.severity}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', margin: '0 0 8px 0' }}>{conflict.description}</p>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        <strong>Resolution Strategy:</strong> {conflict.resolutionStrategy}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        <strong>Stakeholders:</strong> {conflict.stakeholders.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations Panel */}
          {showRecommendations && (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ marginBottom: '16px' }}>💡 AI Recommendations</h3>

              {analysisResults.recommendations.map(rec => (
                <div key={rec.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  background: '#fafafa'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{rec.title}</h4>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '600',
                      background: rec.impact === 'high' ? '#dcfce7' : 
                                 rec.impact === 'medium' ? '#fef3c7' : '#f3f4f6',
                      color: rec.impact === 'high' ? '#166534' : 
                             rec.impact === 'medium' ? '#92400e' : '#374151'
                    }}>
                      {rec.impact} impact
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                    {rec.description}
                  </p>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#374151' }}>
                      Confidence: {rec.confidence}%
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                      Action Items:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {rec.actionItems.map((item, index) => (
                        <li key={index} style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
                    <span>Timeline: {rec.timeline}</span>
                    <span>Benefit: {rec.estimatedBenefit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DecisionSupportSystem;
