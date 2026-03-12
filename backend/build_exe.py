"""Script to build the Flask backend into a standalone exe using PyInstaller."""
import subprocess
import sys
import os
import shutil

def build():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    output_dir = os.path.join(project_root, 'backend_dist')

    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--name', 'ptai_backend',
        '--onedir',
        '--console',
        '--noconfirm',
        '--clean',
        '--distpath', output_dir,
        '--workpath', os.path.join(backend_dir, 'build'),
        '--specpath', backend_dir,
        '--add-data', 'models;models',
        '--add-data', 'routes;routes',
        '--add-data', 'services;services',
        '--add-data', 'database.py;.',
        '--add-data', 'config.py;.',
        '--hidden-import', 'flask',
        '--hidden-import', 'flask_cors',
        '--hidden-import', 'flask_sqlalchemy',
        '--hidden-import', 'sqlalchemy',
        '--hidden-import', 'models',
        '--hidden-import', 'models.athlete',
        '--hidden-import', 'models.metric',
        '--hidden-import', 'routes',
        '--hidden-import', 'routes.athletes',
        '--hidden-import', 'routes.metrics',
        '--hidden-import', 'services.export_service',
        'app.py',
    ]

    print('Building backend exe...')
    result = subprocess.run(cmd, cwd=backend_dir)
    if result.returncode == 0:
        print(f'Build successful! Output in {output_dir}/ptai_backend/')
    else:
        print('Build failed!')
        sys.exit(1)

if __name__ == '__main__':
    build()
