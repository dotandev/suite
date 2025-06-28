-- Create agreements table
CREATE TABLE agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  media_type VARCHAR(50) CHECK (media_type IN ('text', 'document', 'video', 'audio')),
  media_url TEXT,
  encrypted_link TEXT,
  cloudinary_url TEXT,
  creator_address VARCHAR(255) NOT NULL,
  creator_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'on_chain')),
  sui_object_id VARCHAR(255),
  metadata_hash VARCHAR(255),
  media_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parties table
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  address VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'signatory' CHECK (role IN ('creator', 'signatory', 'viewer')),
  has_signed BOOLEAN DEFAULT FALSE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(agreement_id, address)
);

-- Create edit_requests table
CREATE TABLE edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  proposer_address VARCHAR(255) NOT NULL,
  proposer_email VARCHAR(255),
  section_start INTEGER,
  section_end INTEGER,
  original_content TEXT,
  proposed_content TEXT NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create edit_approvals table
CREATE TABLE edit_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_request_id UUID REFERENCES edit_requests(id) ON DELETE CASCADE,
  party_address VARCHAR(255) NOT NULL,
  party_email VARCHAR(255),
  approved BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(edit_request_id, party_address)
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  edit_request_id UUID REFERENCES edit_requests(id) ON DELETE CASCADE,
  author_address VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_agreements_creator ON agreements(creator_address);
CREATE INDEX idx_agreements_status ON agreements(status);
CREATE INDEX idx_parties_agreement ON parties(agreement_id);
CREATE INDEX idx_parties_address ON parties(address);
CREATE INDEX idx_edit_requests_agreement ON edit_requests(agreement_id);
CREATE INDEX idx_edit_requests_status ON edit_requests(status);
CREATE INDEX idx_edit_approvals_request ON edit_approvals(edit_request_id);
CREATE INDEX idx_comments_agreement ON comments(agreement_id);
CREATE INDEX idx_comments_edit_request ON comments(edit_request_id);
