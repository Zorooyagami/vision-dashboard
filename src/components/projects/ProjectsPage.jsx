import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
  fetchProjects,
  deleteProject,
} from '../../services/projectsApi'

export default function ProjectsPage() {
  const navigate = useNavigate()

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

        const result =
          await fetchProjects()

        setProjects(result)
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
    }, [])

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

        setProjects(
          (current) =>
            current.filter(
              (item) =>
                item.projectId !==
                project.projectId
            )
        )
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
    <div className="mx-auto w-full max-w-7xl px-6 py-7">

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
                onOpen={() => {
                    localStorage.setItem(
                        'vision_project_id',
                        project.projectId
                    )

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
      className="
        group
        flex
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-indigo-200
        hover:shadow-md
      "
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

              <p
                className="
                  mt-0.5
                  truncate
                  text-xs
                  text-slate-500
                "
              >
                {hostname}
              </p>

            </div>

          </div>

          <StatusBadge
            connected={
              connected
            }
            status={
              project.status
            }
          />

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