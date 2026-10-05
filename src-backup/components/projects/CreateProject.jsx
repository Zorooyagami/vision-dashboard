// src/components/projects/CreateProject.jsx
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { createProject } from '../../services/projectsApi'

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CreateProject({
  onCreated,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: '',
    websiteUrl: '',
    description: '',
    analytics: true,
    heatmaps: true,
    sessionReplay: true,
  })

  const [step, setStep] =
    useState('form')

  const [creating, setCreating] =
    useState(false)

  const [error, setError] =
    useState('')

  const [
    createdProject,
    setCreatedProject,
  ] = useState(null)

  const [copied, setCopied] =
    useState(false)

  const navigate = useNavigate()

  /* =======================================================
     NORMALIZE WEBSITE
  ======================================================= */

  const normalizedOrigin =
    useMemo(() => {
      if (!form.websiteUrl.trim()) {
        return ''
      }

      try {
        const value =
          form.websiteUrl.startsWith(
            'http'
          )
            ? form.websiteUrl
            : `https://${form.websiteUrl}`

        const url = new URL(value)

        return url.origin
      } catch {
        return ''
      }
    }, [form.websiteUrl])

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  const updateField = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const validate = () => {
    if (!form.name.trim()) {
      return 'Please enter a project name.'
    }

    if (!form.websiteUrl.trim()) {
      return 'Please enter your website URL.'
    }

    if (!normalizedOrigin) {
      return 'Please enter a valid website URL.'
    }

    return ''
  }

  /* =======================================================
     CREATE PROJECT
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const validationError =
        validate()

      if (validationError) {
        setError(validationError)
        return
      }

      try {
        setCreating(true)
        setError('')

        const project =
          await createProject({
            name:
              form.name.trim(),

            websiteUrl:
              normalizedOrigin,

            description:
              form.description.trim(),

            allowedOrigins: [
              normalizedOrigin,
            ],

            settings: {
              analytics:
                form.analytics,

              heatmaps:
                form.heatmaps,

              sessionReplay:
                form.sessionReplay,
            },
          })



        setCreatedProject(
          project
        )

        setStep('install')

        onCreated?.(project)
      } catch (err) {
        console.error(
          '[CreateProject] failed:',
          err
        )

        setError(
          err.message ||
            'Unable to create project.'
        )
      } finally {
        setCreating(false)
      }
    }

  /* =======================================================
     INSTALLATION SCRIPT
  ======================================================= */

  const installationSnippet =
    createdProject
      ? `<script
  async
  src="https://vision-sdk-b9c55.web.app/v1/vision.js"
  data-project-id="${createdProject.projectId}">
</script>`
      : ''

  const copySnippet =
    async () => {
      try {
        await navigator.clipboard.writeText(
          installationSnippet
        )

        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (err) {
        console.error(
          '[CreateProject] copy failed:',
          err
        )
      }
    }

  /* =======================================================
     INSTALL STEP
  ======================================================= */

  if (step === 'install') {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-slate-200 px-7 py-6">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-600">
                ✓
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Project created
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Vision is ready to be installed on{' '}
                  <span className="font-semibold text-slate-700">
                    {createdProject?.name}
                  </span>
                  .
                </p>
              </div>

            </div>
          </div>

          {/* DETAILS */}

          <div className="border-b border-slate-200 bg-slate-50 px-7 py-5">

            <div className="grid gap-5 sm:grid-cols-2">

              <Info
                label="Project"
                value={
                  createdProject?.name
                }
              />

              <Info
                label="Project ID"
                value={
                  createdProject?.projectId
                }
                mono
              />

              <Info
                label="Website"
                value={
                  createdProject?.websiteUrl
                }
              />

              <Info
                label="Status"
                value="Waiting for data"
              />

            </div>
          </div>

          {/* INSTALL */}

          <div className="px-7 py-7">

            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Step 1
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Install Vision
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Copy the following script
              and paste it inside your
              website's{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                &lt;head&gt;
              </code>
              .
            </p>

            {/* CODE */}

            <div className="mt-5 overflow-hidden rounded-xl bg-slate-950">

              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">

                <span className="text-xs font-medium text-slate-400">
                  Installation snippet
                </span>

                <button
                  type="button"
                  onClick={copySnippet}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {copied
                    ? '✓ Copied'
                    : 'Copy'}
                </button>

              </div>

              <pre className="overflow-x-auto p-5 text-sm leading-6 text-emerald-300">
                <code>
                  {installationSnippet}
                </code>
              </pre>

            </div>

            {/* STEP 2 */}

            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">

              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                Step 2
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                Visit your website
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Once the script loads,
                Vision will begin sending
                analytics events for this
                project.
              </p>

            </div>

            {/* ENABLED FEATURES */}

            <div className="mt-6">

              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Enabled tracking
              </p>

              <div className="flex flex-wrap gap-2">

                {createdProject?.settings
                  ?.analytics && (
                  <FeatureBadge>
                    Analytics
                  </FeatureBadge>
                )}

                {createdProject?.settings
                  ?.heatmaps && (
                  <FeatureBadge>
                    Heatmaps
                  </FeatureBadge>
                )}

                {createdProject?.settings
                  ?.sessionReplay && (
                  <FeatureBadge>
                    Session Replay
                  </FeatureBadge>
                )}

              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-7 flex flex-wrap justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setCreatedProject(
                    null
                  )

                  setStep('form')

                  setForm({
                    name: '',
                    websiteUrl: '',
                    description: '',
                    analytics: true,
                    heatmaps: true,
                    sessionReplay: true,
                  })
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Create another
              </button>

             <button
  type="button"
  onClick={() => navigate('/projects')}
  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
>
  Go to projects →
</button>

            </div>

          </div>
        </div>
      </div>
    )
  }

  /* =======================================================
     CREATE PROJECT FORM
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">

      {/* PAGE HEADER */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create a project
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Connect a website to Vision
          and start collecting analytics
          and behaviour data.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >

        {/* PROJECT DETAILS */}

        <section className="border-b border-slate-200 p-6">

          <div className="mb-5">

            <h2 className="font-bold text-slate-900">
              Project details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tell us which website
              you want to track.
            </p>

          </div>

          <div className="space-y-5">

            <Field
              label="Project name"
              required
            >
              <input
                value={form.name}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value
                  )
                }
                placeholder="e.g. ShopEasy"
                className={
                  inputClasses
                }
              />
            </Field>

            <Field
              label="Website URL"
              required
              hint="Primary website"
            >
              <input
                type="text"
                value={
                  form.websiteUrl
                }
                onChange={(event) =>
                  updateField(
                    'websiteUrl',
                    event.target.value
                  )
                }
                placeholder="https://shopeasy.com"
                className={
                  inputClasses
                }
              />

              {normalizedOrigin && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-emerald-600">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  Allowed origin:

                  <span className="font-mono font-semibold">
                    {normalizedOrigin}
                  </span>

                </div>
              )}

            </Field>

            <Field
              label="Description"
              hint="Optional"
            >
              <textarea
                rows={3}
                value={
                  form.description
                }
                onChange={(event) =>
                  updateField(
                    'description',
                    event.target.value
                  )
                }
                placeholder="e.g. ShopEasy ecommerce analytics"
                className={`${inputClasses} resize-none`}
              />
            </Field>

          </div>
        </section>

        {/* TRACKING */}

        <section className="border-b border-slate-200 p-6">

          <div className="mb-5">

            <h2 className="font-bold text-slate-900">
              Tracking features
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select what Vision
              should collect for this
              project.
            </p>

          </div>

          <div className="space-y-3">

            <FeatureToggle
              title="Analytics"
              description="Page views, ecommerce events, devices, sessions and conversions."
              checked={
                form.analytics
              }
              disabled
              onChange={(value) =>
                updateField(
                  'analytics',
                  value
                )
              }
            />

            <FeatureToggle
              title="Heatmaps"
              description="Track clicks and mouse movement across website pages."
              checked={
                form.heatmaps
              }
              onChange={(value) =>
                updateField(
                  'heatmaps',
                  value
                )
              }
            />

            <FeatureToggle
              title="Session Replay"
              description="Capture user sessions using rrweb for playback in Vision."
              checked={
                form.sessionReplay
              }
              onChange={(value) =>
                updateField(
                  'sessionReplay',
                  value
                )
              }
            />

          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* ACTIONS */}

        <div className="flex flex-wrap items-center justify-end gap-3 p-6">

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={creating}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={creating}
            className="
              min-w-[150px]
              rounded-xl
              bg-indigo-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-indigo-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {creating
              ? 'Creating...'
              : 'Create project →'}
          </button>

        </div>

      </form>
    </div>
  )
}

/* =========================================================
   STYLES
========================================================= */

const inputClasses = `
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3.5
  py-2.5
  text-sm
  text-slate-800
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-50
`

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  hint,
  required,
  children,
}) {
  return (
    <div>

      <div className="mb-1.5 flex items-center gap-1">

        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}

        {hint && (
          <span className="ml-auto text-xs text-slate-400">
            {hint}
          </span>
        )}

      </div>

      {children}

    </div>
  )
}

/* =========================================================
   FEATURE TOGGLE
========================================================= */

function FeatureToggle({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        p-4
        transition

        ${
          checked
            ? 'border-indigo-200 bg-indigo-50/40'
            : 'border-slate-200 bg-white'
        }
      `}
    >

      <div>

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={
          checked
        }
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onChange?.(!checked)
          }
        }}
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition-colors

          ${
            checked
              ? 'bg-indigo-600'
              : 'bg-slate-300'
          }

          ${
            disabled
              ? 'cursor-not-allowed opacity-70'
              : 'cursor-pointer'
          }
        `}
      >
        <span
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            shadow-sm
            transition-all

            ${
              checked
                ? 'left-6'
                : 'left-1'
            }
          `}
        />
      </button>

    </div>
  )
}

/* =========================================================
   INFO
========================================================= */

function Info({
  label,
  value,
  mono = false,
}) {
  return (
    <div>

      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1
          break-all
          text-sm
          font-semibold
          text-slate-800

          ${
            mono
              ? 'font-mono'
              : ''
          }
        `}
      >
        {value || '—'}
      </p>

    </div>
  )
}

/* =========================================================
   FEATURE BADGE
========================================================= */

function FeatureBadge({
  children,
}) {
  return (
    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
      {children}
    </span>
  )
}