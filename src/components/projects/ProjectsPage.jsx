import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'
import { useProject } from '../../context/ProjectContext'

import {
  fetchProjects,
  deleteProject,
} from '../../services/projectsApi'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { projectId: activeProjectId, selectProject, clearProject } = useProject()

  const [projects, setProjects] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [deletingId, setDeletingId] =
    useState(null)

  const [copiedId, setCopiedId] =
    useState(null)

  /* =======================================================
     LOAD PROJECTS
  ======================================================= */

  const loadProjects =
    useCallback(async () => {
      try {
        setLoading(true)
        setError('')

        const result = await fetchProjects()

        const projectList = Array.isArray(result) ? result : result?.projects
        if (!Array.isArray(projectList)) {
          throw new Error('Invalid projects response.')
        }
        setProjects(projectList)

        if (activeProjectId) {
          const activeProject = projectList.find(
            (project) => project.projectId === activeProjectId,
          )

          if (activeProject) {
            selectProject(activeProject)
          } else {
            clearProject()
          }
        }
      } catch (err) {
        console.error(
          '[ProjectsPage] failed:',
          err
        )

        setError(
          err.message ||
            'Unable to load projects.'
        )
      } finally {
        setLoading(false)
      }
    }, [activeProjectId, clearProject, selectProject])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  /* =======================================================
     COPY PROJECT ID
  ======================================================= */

  const copyProjectId =
    async (projectId) => {
      try {
        await navigator.clipboard.writeText(
          projectId
        )

        setCopiedId(projectId)

        setTimeout(() => {
          setCopiedId(null)
        }, 1800)
      } catch (err) {
        console.error(
          'Copy failed:',
          err
        )
      }
    }

  /* =======================================================
     DELETE PROJECT
  ======================================================= */

  const handleDelete =
    async (project) => {
      const confirmed =
        window.confirm(
          `Delete "${project.name}"?\n\nThis action cannot be undone.`
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingId(
          project.projectId
        )

        await deleteProject(
          project.projectId
        )

        setProjects((current) =>
          current.filter((item) => item.projectId !== project.projectId),
        )

        if (activeProjectId === project.projectId) {
          clearProject()
        }
      } catch (err) {
        console.error(
          '[ProjectsPage] delete failed:',
          err
        )

        alert(
          err.message ||
            'Failed to delete project.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-indigo-600
            "
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading projects...
          </p>

        </div>

      </div>
    )
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          mb-7
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the websites connected
            to Vision Analytics.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/projects/create'
            )
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-indigo-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-indigo-700
          "
        >
          <span className="text-lg leading-none">
            +
          </span>

          Create project
        </button>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          className="
            mb-6
            flex
            items-center
            justify-between
            gap-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
          "
        >

          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadProjects
            }
            className="
              text-sm
              font-semibold
              text-red-600
              hover:text-red-700
            "
          >
            Retry
          </button>

        </div>
      )}

      {/* ===================================================
          EMPTY
      =================================================== */}

      {!error &&
        projects.length === 0 && (
          <EmptyProjects
            onCreate={() =>
              navigate(
                '/projects/create'
              )
            }
          />
        )}

      {/* ===================================================
          PROJECTS GRID
      =================================================== */}

      {projects.length > 0 && (
        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {projects.map(
            (project) => (
              <ProjectCard
                key={
                  project.projectId
                }
                project={
                  project
                }
                deleting={
                  deletingId ===
                  project.projectId
                }
                copied={
                  copiedId ===
                  project.projectId
                }
                active={activeProjectId === project.projectId}
                onOpen={() => {
                  selectProject(project)
                  navigate('/home')
                }}
                onCopy={() =>
                  copyProjectId(
                    project.projectId
                  )
                }
                onDelete={() =>
                  handleDelete(
                    project
                  )
                }
              />
            )
          )}

        </div>
      )}

    </div>
  )
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  deleting,
  copied,
  onOpen,
  onCopy,
  onDelete,
  active = false,
}) {
  const connected =
    Boolean(
      project.lastEventAt
    )

  const hostname =
    getHostname(
      project.websiteUrl
    )

  return (
    <div
      className={`
        group
        flex
        flex-col
        overflow-hidden
        rounded-2xl
        border
        bg-white
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-indigo-200
        hover:shadow-md
        ${active ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'}
      `}
    >

      {/* TOP */}

      <div className="p-5">

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-indigo-50
                text-lg
                font-bold
                text-indigo-600
              "
            >
              {getInitial(
                project.name
              )}
            </div>

            <div className="min-w-0">

              <h2
                className="
                  truncate
                  text-base
                  font-bold
                  text-slate-900
                "
              >
                {project.name}
              </h2>

              {/* <p
                className="
                  mt-0.5
                  truncate
                  text-xs
                  text-slate-500
                "
              >
                {hostname}
              </p> */}

            </div>

          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusBadge
              connected={connected}
              status={project.status}
            />
            {active && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                Active
              </span>
            )}
          </div>

        </div>

        {/* DESCRIPTION */}

        {project.description && (
          <p
            className="
              mt-4
              line-clamp-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            {
              project.description
            }
          </p>
        )}

        <ProjectWebsites
          websiteUrl={project.websiteUrl}
          allowedOrigins={project.allowedOrigins}
        />

        {/* PROJECT ID */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            gap-2
            rounded-lg
            bg-slate-50
            px-3
            py-2
          "
        >

          <div className="min-w-0">

            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Project ID
            </p>

            <p
              className="
                truncate
                font-mono
                text-xs
                font-semibold
                text-slate-600
              "
            >
              {project.projectId}
            </p>

          </div>

          <button
            type="button"
            onClick={onCopy}
            className="
              shrink-0
              rounded-md
              border
              border-slate-200
              bg-white
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-slate-500
              transition
              hover:border-indigo-200
              hover:text-indigo-600
            "
          >
            {copied
              ? '✓ Copied'
              : 'Copy'}
          </button>

        </div>

        {/* FEATURES */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-1.5
          "
        >

          {project.settings
            ?.analytics && (
            <FeatureBadge>
              Analytics
            </FeatureBadge>
          )}

          {project.settings
            ?.heatmaps && (
            <FeatureBadge>
              Heatmaps
            </FeatureBadge>
          )}

          {project.settings
            ?.sessionReplay && (
            <FeatureBadge>
              Session Replay
            </FeatureBadge>
          )}

        </div>

      </div>

      {/* FOOTER */}

      <div
        className="
          mt-auto
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-slate-100
          bg-slate-50/60
          px-5
          py-3.5
        "
      >

        <div>

          <p className="text-[10px] font-medium text-slate-400">
            {connected
              ? 'Last event'
              : 'Connection'}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-slate-600">
            {connected
              ? formatRelativeTime(
                  project.lastEventAt
                )
              : 'Waiting for data'}
          </p>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            title="Delete project"
            className=" 
              rounded-lg
              border
              border-slate-200
              bg-white
              px-2.5
              py-2
              text-xs
              font-semibold
              text-slate-400
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-500
              disabled:opacity-50
            "
          >
            {deleting
              ? '...'
              : 'Delete'}
          </button>

          <button
            type="button"
            onClick={onOpen}
            className="
              rounded-lg
              bg-indigo-600
              px-3.5
              py-2
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-indigo-700
            "
          >
            Open →
          </button>

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  connected,
  status,
}) {
  if (
    status === 'disabled'
  ) {
    return (
      <span
        className="
          shrink-0
          rounded-full
          bg-slate-100
          px-2.5
          py-1
          text-[10px]
          font-semibold
          text-slate-500
        "
      >
        Disabled
      </span>
    )
  }

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold

        ${
          connected
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-amber-50 text-amber-600'
        }
      `}
    >

      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${
            connected
              ? 'bg-emerald-500'
              : 'bg-amber-400'
          }
        `}
      />

      {connected
        ? 'Connected'
        : 'Waiting'}

    </span>
  )
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyProjects({
  onCreate,
}) {
  return (
    <div
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-300
        bg-white
        px-6
        text-center
      "
    >

      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-indigo-50
          text-2xl
        "
      >
        📊
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        Create your first project
      </h2>

      <p
        className="
          mt-2
          max-w-md
          text-sm
          leading-6
          text-slate-500
        "
      >
        Connect a website to
        Vision to start collecting
        analytics, heatmaps and
        session replay data.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="
          mt-6
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
        "
      >
        + Create project
      </button>

    </div>
  )
}

/* =========================================================
   FEATURE
========================================================= */

function FeatureBadge({
  children,
}) {
  return (
    <span
      className="
        rounded-full
        border
        border-indigo-100
        bg-indigo-50
        px-2.5
        py-1
        text-[10px]
        font-semibold
        text-indigo-600
      "
    >
      {children}
    </span>
  )
}

/* =========================================================
   HELPERS
========================================================= */

function parseWebsite(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url : null
  } catch {
    return null
  }
}

function ProjectWebsites({ websiteUrl, allowedOrigins }) {
  const website = parseWebsite(websiteUrl)
  const origins = [...new Set(
    (Array.isArray(allowedOrigins) ? allowedOrigins : [])
      .filter((origin) => typeof origin === 'string' && origin.trim())
      .map((origin) => origin.trim()),
  )]

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
          Website URL
        </p>
        {website ? (
          <a
            href={website.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${websiteUrl} in a new tab`}
            className="mt-1.5 flex min-w-0 items-start gap-2 rounded text-sm font-semibold leading-6 text-indigo-900 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span className="min-w-0 flex-1 break-all">{websiteUrl}</span>
            <span aria-hidden="true" className="shrink-0">↗</span>
          </a>
        ) : (
          <p className="mt-1.5 break-all text-sm text-slate-600">
            {websiteUrl || 'No website configured'}
          </p>
        )}
      </div>

      {/* <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Allowed origins
          </p>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {origins.length}
          </span>
        </div>
        {origins.length ? (
          <ul className="mt-2.5 space-y-2">
            {origins.map((origin) => {
              const parsed = parseWebsite(origin)
              const local = parsed && (
                ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) ||
                parsed.hostname.endsWith('.localhost')
              )
              const primary = parsed && website && parsed.origin === website.origin
              const badge = local ? 'Local development' : primary ? 'Primary website' : null
              return (
                <li key={origin} className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                  {badge && (
                    <span className={`mb-1.5 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${local ? 'bg-amber-50 text-amber-800' : 'bg-indigo-50 text-indigo-700'}`}>
                      {badge}
                    </span>
                  )}
                  <p className="break-all font-mono text-xs font-medium leading-5 text-slate-700">
                    {origin}
                  </p>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500">No allowed origins configured.</p>
        )}
      </div> */}
    </div>
  )
}

function getInitial(name) {
  return (
    name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    'V'
  )
}

function getHostname(url) {
  try {
    return new URL(
      url
    ).hostname
  } catch {
    return (
      url ||
      'Unknown website'
    )
  }
}

function formatRelativeTime(value) {
  if (!value) {
    return 'Waiting for data'
  }

  const date =
    new Date(value)

  const seconds =
    Math.floor(
      (
        Date.now() -
        date.getTime()
      ) /
        1000
    )

  if (seconds < 10) {
    return 'Just now'
  }

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes =
    Math.floor(
      seconds / 60
    )

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours =
    Math.floor(
      minutes / 60
    )

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days =
    Math.floor(
      hours / 24
    )

  return `${days}d ago`
}