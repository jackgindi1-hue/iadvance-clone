import { NextRequest, NextResponse } from 'next/server';

// GitHub repo details
const GITHUB_OWNER = 'jackgindi1-hue';
const GITHUB_REPO = 'highline-funding';
const CONFIG_PATH = 'src/config/upload-campaigns.json';

interface Campaign {
  slug: string;
  title: string;
  images: string[];
}

export async function POST(request: NextRequest) {
  try {
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured. Please add GITHUB_TOKEN to environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { slug, title, images } = body;

    // Validate input
    if (!slug || !images || images.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid campaign data. Need slug and 2 images.' },
        { status: 400 }
      );
    }

    // Fetch current config file from GitHub
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONFIG_PATH}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!getFileResponse.ok) {
      const errorText = await getFileResponse.text();
      console.error('GitHub API error:', getFileResponse.status, errorText);

      if (getFileResponse.status === 401) {
        return NextResponse.json(
          { error: 'GitHub token is invalid or expired. Please check your GITHUB_TOKEN in Netlify.' },
          { status: 500 }
        );
      }
      if (getFileResponse.status === 403) {
        return NextResponse.json(
          { error: 'GitHub token does not have permission. Make sure it has "Contents" read/write access to the repository.' },
          { status: 500 }
        );
      }
      if (getFileResponse.status === 404) {
        return NextResponse.json(
          { error: 'Repository or file not found. Check that the repo exists and the token has access.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Failed to fetch config from GitHub (${getFileResponse.status})` },
        { status: 500 }
      );
    }

    const fileData = await getFileResponse.json();
    const currentContent = JSON.parse(
      Buffer.from(fileData.content, 'base64').toString('utf-8')
    );

    // Check if slug already exists
    if (currentContent.campaigns.some((c: Campaign) => c.slug === slug)) {
      return NextResponse.json(
        { error: 'A campaign with this URL name already exists' },
        { status: 400 }
      );
    }

    // Add new campaign
    const newCampaign: Campaign = {
      slug,
      title: title || '',
      images,
    };
    currentContent.campaigns.push(newCampaign);

    // Update file on GitHub
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONFIG_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add campaign: ${slug}`,
          content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
          sha: fileData.sha,
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('GitHub update error:', error);
      return NextResponse.json(
        { error: 'Failed to save campaign to GitHub' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign created! It will be live in ~1-2 minutes after auto-deploy.',
      url: `https://highlinefunding.com/upload/${slug}`,
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}