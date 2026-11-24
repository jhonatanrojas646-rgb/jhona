# Prueba realista: el tarro de Nurea con gomitas de piña, en Cycles (CPU). Sin abrir Blender.
# Uso: python escena.py --foto 1 [--rapido]   |   python escena.py --anim 1 48
import bpy, sys, math, os, time
from mathutils import Vector
A = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
AQUI = os.path.dirname(os.path.abspath(__file__))
rapido = "--rapido" in A
bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene; S.render.engine = "CYCLES"; S.cycles.device = "CPU"
S.cycles.samples = 12 if rapido else 64; S.cycles.use_denoising = True
S.render.resolution_x, S.render.resolution_y = 1080, 1920; S.render.resolution_percentage = 25 if rapido else 50
S.render.fps = 30; S.view_settings.view_transform = "Khronos PBR Neutral"; S.render.threads_mode = "AUTO"

def mat(name, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m, b
def smooth(o, bevel=0.0):
    for p in o.data.polygons: p.use_smooth = True
    if bevel: md = o.modifiers.new("b", "BEVEL"); md.width = bevel; md.segments = 6; md.limit_method = "ANGLE"
    o.modifiers.new("s", "SUBSURF").levels = 1

# fondo curvo rosado
bpy.ops.mesh.primitive_plane_add(size=4); piso = bpy.context.object
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="DESELECT"); bpy.ops.object.mode_set(mode="OBJECT")
m = piso.data; m.vertices[2].select = m.vertices[3].select = True
for e in m.edges: e.select = all(m.vertices[v].co.y > 0 for v in e.vertices)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.extrude_region_move(TRANSFORM_OT_translate={"value": (0, 0, 2.5)}); bpy.ops.object.mode_set(mode="OBJECT")
piso.location.y = 1.4; md = piso.modifiers.new("b", "BEVEL"); md.width = 0.5; md.segments = 16
for p in piso.data.polygons: p.use_smooth = True
piso.data.materials.append(mat("fondo", **{"Base Color": (1.0, 0.55, 0.72, 1), "Roughness": 0.55})[0])

# tarro: cuerpo con etiqueta enrollada + tapa
R, HB, HT = 0.046, 0.066, 0.034
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=R, depth=HB, location=(0, 0, HB / 2)); cuerpo = bpy.context.object; smooth(cuerpo, 0.004)
mc, b = mat("cuerpo", **{"Roughness": 0.32, "Coat Weight": 0.4})
nt = mc.node_tree; img = nt.nodes.new("ShaderNodeTexImage"); img.image = bpy.data.images.load(os.path.join(AQUI, "etiqueta.png")); img.projection = "TUBE"
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], img.inputs["Vector"]); nt.links.new(img.outputs["Color"], b.inputs["Base Color"])
cuerpo.data.materials.append(mc); cuerpo.rotation_euler.z = math.radians(float(os.environ.get("GIRO", "180")))
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=R * 1.06, depth=HT, location=(0, 0, HB + HT / 2 - 0.002)); tapa = bpy.context.object; smooth(tapa, 0.009)
tapa.data.materials.append(mat("tapa", **{"Base Color": (0.78, 0.05, 0.42, 1), "Roughness": 0.28, "Coat Weight": 0.5})[0])

# gomitas de piña: cuerpo translúcido con rombos en relieve + corona
mg, b = mat("gomita", **{"Base Color": (1.0, 0.62, 0.05, 1), "Roughness": 0.22, "Subsurface Weight": 1.0, "Subsurface Scale": 0.012, "Coat Weight": 0.6, "IOR": 1.45})
b.inputs["Subsurface Radius"].default_value = (1.0, 0.45, 0.1)
nt = mg.node_tree; tc = nt.nodes.new("ShaderNodeTexCoord"); bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.55; bump.inputs["Distance"].default_value = 0.002
mx = nt.nodes.new("ShaderNodeMath"); mx.operation = "MAXIMUM"
for i, rot in enumerate((0.7, -0.7)):
    w = nt.nodes.new("ShaderNodeTexWave"); w.inputs["Scale"].default_value = 9; mpn = nt.nodes.new("ShaderNodeMapping"); mpn.inputs["Rotation"].default_value = (0, rot, 0)
    nt.links.new(tc.outputs["Object"], mpn.inputs["Vector"]); nt.links.new(mpn.outputs["Vector"], w.inputs["Vector"]); nt.links.new(w.outputs["Fac"], mx.inputs[i])
nt.links.new(mx.outputs[0], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
mh = mat("hoja", **{"Base Color": (0.25, 0.62, 0.12, 1), "Roughness": 0.3, "Subsurface Weight": 1.0, "Subsurface Scale": 0.008, "Coat Weight": 0.5})[0]
def gomita(x, y, giro, tumbada=False):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.011, location=(x, y, 0.0135)); g = bpy.context.object; g.scale = (1, 0.8, 1.22); smooth(g)
    g.data.materials.append(mg); hojas = []
    for i in range(5):
        a = (i - 2) * 0.42
        bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.0036, depth=0.013, location=(x + math.sin(a) * 0.006, y, 0.031 + math.cos(a) * 0.004 - abs(i - 2) * 0.0012)); h = bpy.context.object
        h.rotation_euler.y = a; h.scale.y = 0.6; smooth(h); h.data.materials.append(mh); h.parent = g; h.matrix_parent_inverse = g.matrix_world.inverted(); hojas.append(h)
    g.rotation_euler.z = giro
    if tumbada: g.rotation_euler.x = math.radians(78); g.location.z = 0.0095
    return g
gomita(-0.062, -0.045, 0.3); gomita(0.058, -0.052, -0.4); gomita(0.02, -0.075, 0.9, True)

# luces: principal cálida arriba a la izquierda, contraluz fría a la derecha, relleno suave
def luz(loc, energia, color, tam):
    bpy.ops.object.light_add(type="AREA", location=loc); l = bpy.context.object; l.data.energy = energia; l.data.color = color; l.data.size = tam
    d = Vector((0, 0, 0.05)) - Vector(loc); l.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); return l
luz((-0.35, -0.35, 0.5), 5.5, (1.0, 0.93, 0.85), 0.4); luz((0.45, 0.25, 0.3), 4, (0.8, 0.88, 1.0), 0.3); luz((0.0, -0.6, 0.15), 1.2, (1.0, 0.85, 0.9), 0.6)
W = bpy.data.worlds.new("w"); S.world = W; W.use_nodes = True; W.node_tree.nodes["Background"].inputs[0].default_value = (1.0, 0.72, 0.82, 1); W.node_tree.nodes["Background"].inputs[1].default_value = 0.22

# cámara vertical que se acerca despacio, nunca quieta
bpy.ops.object.camera_add(); cam = bpy.context.object; S.camera = cam; cam.data.lens = 70; cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 4.0
bpy.ops.object.empty_add(location=(0, -0.01, 0.052)); obj = bpy.context.object; cam.data.dof.focus_object = obj
tr = cam.constraints.new("TRACK_TO"); tr.target = obj; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
for fr, loc in ((1, (0.10, -0.64, 0.17)), (90, (-0.05, -0.50, 0.13))):
    cam.location = loc; cam.keyframe_insert("location", frame=fr)
S.frame_start, S.frame_end = 1, 90

os.makedirs(os.path.join(AQUI, "fotos"), exist_ok=True)
if "--foto" in A:
    for fr in A[A.index("--foto") + 1].split(","):
        S.frame_set(int(fr)); S.render.filepath = os.path.join(AQUI, "fotos", f"f{int(fr):03d}.png"); t0 = time.time(); bpy.ops.render.render(write_still=True); print(f"FOTO {fr}: {time.time() - t0:.1f} s", flush=True)
if "--anim" in A:
    i = A.index("--anim"); a, b2 = int(A[i + 1]), int(A[i + 2]); os.makedirs(os.path.join(AQUI, "cuadros"), exist_ok=True)
    for fr in range(a, b2 + 1):
        S.frame_set(fr); S.render.filepath = os.path.join(AQUI, "cuadros", f"c{fr:04d}.png"); t0 = time.time(); bpy.ops.render.render(write_still=True); print(f"CUADRO {fr}: {time.time() - t0:.1f} s", flush=True)
