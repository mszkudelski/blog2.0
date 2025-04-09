const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const rsort = require('semver/functions/rsort');
const inc = require('semver/functions/inc');
const { labelPriority } = require('./labelUtils.cjs');
const core = require('@actions/core');

const prNumberArg = process.argv[2];

async function getCurrentVersionFromGitTag() {
    const { stdout } = await execPromise('git tag -l');
    const tags = stdout.split('\n').filter(Boolean);

    const filteredVersions = tags.reduce((acc, tag) => {
        const match = tag.match(/[0-9]+\.[0-9]+\.[0-9]+/);
        return match ? [...acc, match[0]] : acc;
    }, []);

    const sortedVersions = rsort(filteredVersions);

    return sortedVersions[0];
};

function determineVersionLabel(labels) {
    return labels.reduce((acc, label) => {
        if ((!acc || labelPriority[label.name] >= labelPriority[acc]) && ['patch', 'minor', 'major'].includes(label.name)) {
            return label.name;
        }
        return acc;
    }, 'patch');
};

function getNewReleaseVersion(currentVersion, versionLabel) {
    return inc(currentVersion, versionLabel);
}

async function getNextVersion(prNumber) {
    if (!prNumber) {
        throw new Error('No PR number provided');
    }

    core.info(`Starting process of versioning for PR nr: ${prNumber}`);

    try {
        const { stdout } = await execPromise(`gh pr view ${prNumber} --json labels`);
        const prLabels = JSON.parse(stdout).labels;

        core.info(`PR labels: ${prLabels.map(label => label.name).join(', ')}`);

        const currentVersion = await getCurrentVersionFromGitTag();
        core.info(`Current version: ${currentVersion}`);


        let version = '';

        if (currentVersion) {
            const versionLabel = determineVersionLabel(prLabels) || 'patch';
            core.info(`Determined version label: ${versionLabel}`);


            version = getNewReleaseVersion(currentVersion, versionLabel);
        } else {
            version = '0.1.0';
        }

        await execPromise(`gh release create ${version} -t ${version} --generate-notes`);
        core.info('Github Release created with version: ' + version);

        return version;
    } catch (error) {
        const isReleaseConflictError = error.message.includes('Release.tag_name already exists');

        if (isReleaseConflictError) {
            core.warning('Github Release with such version already exists. More info: ' + error.message);
            return version;
        }

        throw error;
    }
}

module.exports = {
    getNextVersion,
};

if (require.main === module) {
    getNextVersion(prNumberArg)
        .then((version) => {
            if (core) {
                core.setOutput('version', version);
            }
        })
        .catch((error) => {
            core.setFailed(error.message);
        });
}
